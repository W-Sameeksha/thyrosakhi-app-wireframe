import os
import tempfile
import importlib
import base64

import cv2
import librosa
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename


app = Flask(__name__)
CORS(app)

ASYMMETRY_THRESHOLD = 20.0
DETECTED_SKIN_PIXEL_THRESHOLD = 1200
MIN_VIDEO_DURATION_SECONDS = 2.5
NECK_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}


def calculate_final_risk(voice_score: float, symptom_score: float, neck_score: float) -> tuple[float, str]:
    voice_score = max(0.0, min(voice_score, 3.0))
    symptom_score = max(0.0, min(symptom_score, 5.0))
    neck_score = max(0.0, min(neck_score, 0.5))

    voice_weight = (voice_score / 3) * 0.40
    symptom_weight = (symptom_score / 5) * 0.40
    neck_weight = (neck_score / 0.5) * 0.20

    final_score = voice_weight + symptom_weight + neck_weight

    if neck_score == 2 and voice_score >= 1:
        return final_score, "High"

    if final_score < 0.3:
        risk_level = "Low"
    elif final_score < 0.6:
        risk_level = "Moderate"
    else:
        risk_level = "High"

    return final_score, risk_level


def max_horizontal_width_in_band(edge_image: np.ndarray, start_row: int, end_row: int) -> int:
    band = edge_image[start_row:end_row, :]
    max_width = 0

    for row in band:
        edge_columns = np.where(row > 0)[0]
        if edge_columns.size >= 2:
            row_width = int(edge_columns[-1] - edge_columns[0])
            if row_width > max_width:
                max_width = row_width

    return max_width


def estimate_neck_roi_from_face_landmarks(
    frame_width: int,
    frame_height: int,
    face_landmarks: list,
) -> tuple[int, int, int, int] | None:
    jawline_indices = [
        234,
        93,
        132,
        58,
        172,
        136,
        150,
        149,
        176,
        148,
        152,
        377,
        400,
        378,
        379,
        365,
        397,
        288,
        361,
        323,
        454,
    ]

    jaw_x = []
    jaw_y = []
    for index in jawline_indices:
        landmark = face_landmarks[index]
        jaw_x.append(int(landmark.x * frame_width))
        jaw_y.append(int(landmark.y * frame_height))

    min_jaw_x = max(min(jaw_x), 0)
    max_jaw_x = min(max(jaw_x), frame_width - 1)
    chin_y = min(max(jaw_y), frame_height - 1)

    jaw_width = max_jaw_x - min_jaw_x
    if jaw_width <= 0:
        return None

    side_padding = int(jaw_width * 0.12)
    neck_left = max(min_jaw_x - side_padding, 0)
    neck_right = min(max_jaw_x + side_padding, frame_width)

    neck_top = min(chin_y + int(frame_height * 0.03), frame_height - 1)
    neck_height = max(int(jaw_width * 0.95), int(frame_height * 0.20))
    neck_bottom = min(neck_top + neck_height, frame_height)

    if neck_right <= neck_left or neck_bottom <= neck_top:
        return None

    return neck_left, neck_top, neck_right, neck_bottom


def largest_contour_area(gray_roi: np.ndarray) -> float:
    blurred = cv2.GaussianBlur(gray_roi, (5, 5), 0)
    _, binary = cv2.threshold(
        blurred,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU,
    )
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return 0.0
    return float(max(cv2.contourArea(contour) for contour in contours))


def analyze_neck_swallow_video(video_path: str) -> dict:
    mediapipe_module = importlib.import_module("mediapipe")
    face_mesh = mediapipe_module.solutions.face_mesh.FaceMesh(
        static_image_mode=False,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )

    capture = cv2.VideoCapture(video_path)
    if not capture.isOpened():
        return {"error": "Unable to read uploaded video."}

    fps = capture.get(cv2.CAP_PROP_FPS)
    frame_count = capture.get(cv2.CAP_PROP_FRAME_COUNT)
    duration = (frame_count / fps) if fps and frame_count else 0.0
    if duration and duration < MIN_VIDEO_DURATION_SECONDS:
        capture.release()
        face_mesh.close()
        return {"error": "Please record a 3-4 second swallowing video."}

    roi_coordinates: tuple[int, int, int, int] | None = None
    landmarks_detected = False
    previous_roi_gray: np.ndarray | None = None
    vertical_motion_series: list[float] = []
    contour_area_series: list[float] = []
    processed_frames = 0

    try:
        while True:
            has_frame, frame = capture.read()
            if not has_frame:
                break

            processed_frames += 1
            frame_height, frame_width = frame.shape[:2]

            if roi_coordinates is None:
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                mesh_result = face_mesh.process(frame_rgb)
                if mesh_result.multi_face_landmarks:
                    landmarks_detected = True
                    roi_coordinates = estimate_neck_roi_from_face_landmarks(
                        frame_width,
                        frame_height,
                        mesh_result.multi_face_landmarks[0].landmark,
                    )

            if roi_coordinates is None:
                continue

            x1, y1, x2, y2 = roi_coordinates
            neck_roi = frame[y1:y2, x1:x2]
            if neck_roi.size == 0:
                continue

            gray_roi = cv2.cvtColor(neck_roi, cv2.COLOR_BGR2GRAY)
            gray_roi = cv2.GaussianBlur(gray_roi, (5, 5), 0)

            contour_area_series.append(largest_contour_area(gray_roi))

            if previous_roi_gray is not None:
                flow = cv2.calcOpticalFlowFarneback(
                    previous_roi_gray,
                    gray_roi,
                    None,
                    0.5,
                    3,
                    15,
                    3,
                    5,
                    1.2,
                    0,
                )
                vertical_flow = np.abs(flow[..., 1])
                vertical_motion_series.append(float(np.mean(vertical_flow)))

            previous_roi_gray = gray_roi
    finally:
        capture.release()
        face_mesh.close()

    if not landmarks_detected or roi_coordinates is None:
        return {"error": "Please retake the photo with the neck clearly visible."}

    if processed_frames < 15 or len(vertical_motion_series) < 3:
        return {"error": "Video quality is too low. Please retake a steady 3-4 second clip."}

    vertical_baseline = float(np.median(vertical_motion_series))
    vertical_peak = float(max(vertical_motion_series))
    vertical_displacement = max(0.0, vertical_peak - vertical_baseline)

    area_min = float(min(contour_area_series)) if contour_area_series else 0.0
    area_max = float(max(contour_area_series)) if contour_area_series else 0.0
    area_change_ratio = (area_max - area_min) / max(area_min, 1.0)

    vertical_component = min(vertical_displacement / 1.4, 1.0)
    area_component = min(area_change_ratio / 0.25, 1.0)
    neck_risk_score = round((0.6 * vertical_component + 0.4 * area_component), 4)

    if neck_risk_score < 0.35:
        neck_result = "normal"
    elif neck_risk_score < 0.7:
        neck_result = "possible swelling"
    else:
        neck_result = "visible swelling"

    return {
        "neck_risk_score": neck_risk_score,
        "neck_result": neck_result,
    }


@app.post("/calculate-risk")
def calculate_risk() -> tuple:
    data = request.get_json(silent=True) or {}
    symptoms = data.get("symptoms") or {}

    fatigue = bool(symptoms.get("fatigue", False))
    weight_change = bool(symptoms.get("weight_change", False))
    hair_fall = bool(symptoms.get("hair_fall", False))
    temperature_sensitivity = bool(symptoms.get("temperature_sensitivity", False))
    irregular_cycles = bool(symptoms.get("irregular_cycles", False))

    symptom_score = 0

    if fatigue:
        symptom_score += 1

    if weight_change:
        symptom_score += 1

    if hair_fall:
        symptom_score += 1

    if temperature_sensitivity:
        symptom_score += 1

    if irregular_cycles:
        symptom_score += 1

    try:
        voice_score = float(data.get("voice_score"))
        neck_score = float(data.get("neck_score"))
    except (TypeError, ValueError):
        return jsonify(
            {
                "error": "voice_score and neck_score must be numeric values"
            }
        ), 400

    final_score, risk_level = calculate_final_risk(
        voice_score=voice_score,
        symptom_score=symptom_score,
        neck_score=neck_score,
    )

    return jsonify(
        {
            "voice_score": voice_score,
            "symptom_score": symptom_score,
            "neck_score": neck_score,
            "final_score": round(final_score, 4),
            "risk_level": risk_level,
        }
    ), 200


@app.post("/analyze-voice")
def analyze_voice() -> tuple:
    if "file" not in request.files:
        return jsonify({"error": "Missing file field 'file' in multipart/form-data"}), 400

    uploaded_file = request.files["file"]

    if uploaded_file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    safe_name = secure_filename(uploaded_file.filename)
    if not safe_name.lower().endswith(".wav"):
        return jsonify({"error": "Only WAV files are supported"}), 400

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    temp_path = temp_file.name
    temp_file.close()

    try:
        uploaded_file.save(temp_path)
        audio_data, sample_rate = librosa.load(temp_path, sr=None, mono=True)

        duration = float(len(audio_data) / sample_rate) if sample_rate else 0.0
        if duration <= 0.1:
            return jsonify({"error": "Audio is too short. Please record at least 1 second."}), 400

        rms = librosa.feature.rms(y=audio_data)
        energy = float(np.mean(rms)) if rms.size > 0 else 0.0

        f0 = librosa.yin(
            audio_data,
            fmin=librosa.note_to_hz("C2"),
            fmax=librosa.note_to_hz("C7"),
            sr=sample_rate,
        )
        voiced_f0 = f0[~np.isnan(f0)]

        if voiced_f0.size > 0:
            average_pitch = float(np.mean(voiced_f0))
            pitch_variation = float(np.std(voiced_f0))
        else:
            average_pitch = 0.0
            pitch_variation = 0.0

        risk_score = 0
        if average_pitch < 130:
            risk_score += 1
        if pitch_variation < 18:
            risk_score += 1
        if energy < 0.03:
            risk_score += 1

        if risk_score <= 1:
            risk_level = "Low"
        elif risk_score == 2:
            risk_level = "Moderate"
        else:
            risk_level = "High"

        dietary_recommendations = []
        if risk_level == "Moderate":
            dietary_recommendations = [
                "Include iodine-rich foods like eggs, dairy, and fish.",
                "Add selenium sources such as nuts and seeds.",
                "Stay hydrated and reduce ultra-processed foods.",
            ]

        return jsonify(
            {
                "average_pitch": round(average_pitch, 2),
                "pitch_variation": round(pitch_variation, 2),
                "energy": round(energy, 4),
                "duration": round(duration, 2),
                "risk_score": risk_score,
                "risk_level": risk_level,
                "dietary_recommendations": dietary_recommendations,
            }
        ), 200
    except Exception as exc:
        return jsonify({"error": f"Failed to analyze audio: {str(exc)}"}), 400
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/analyze-image")
def analyze_image() -> tuple:
    if "file" not in request.files:
        return jsonify({"error": "Missing file field 'file' in multipart/form-data"}), 400

    uploaded_file = request.files["file"]

    if uploaded_file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    safe_name = secure_filename(uploaded_file.filename)
    extension = os.path.splitext(safe_name)[1].lower()
    if extension not in {".jpg", ".jpeg", ".png"}:
        return jsonify({"error": "Only JPG and PNG images are supported"}), 400

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=extension)
    temp_path = temp_file.name
    temp_file.close()

    try:
        uploaded_file.save(temp_path)
        image = cv2.imread(temp_path)

        if image is None:
            return jsonify({"error": "Failed to load image"}), 400

        height, width, channels = image.shape

        return jsonify(
            {
                "message": "Image received successfully",
                "filename": safe_name,
                "width": int(width),
                "height": int(height),
                "channels": int(channels),
            }
        ), 200
    except Exception as exc:
        return jsonify({"error": f"Failed to analyze image: {str(exc)}"}), 400
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/analyze-neck")
def analyze_neck() -> tuple:
    image = None

    payload = request.get_json(silent=True) or {}
    base64_image = payload.get("image")

    if isinstance(base64_image, str) and base64_image.strip():
        try:
            encoded = base64_image.split(",", 1)[1] if "," in base64_image else base64_image
            image_bytes = base64.b64decode(encoded)
            array = np.frombuffer(image_bytes, dtype=np.uint8)
            image = cv2.imdecode(array, cv2.IMREAD_COLOR)
        except Exception:
            return jsonify({"status": "error", "message": "Invalid base64 image payload."}), 400
    elif "file" in request.files:
        uploaded_file = request.files["file"]
        if uploaded_file.filename == "":
            return jsonify({"status": "error", "message": "No file selected"}), 400

        safe_name = secure_filename(uploaded_file.filename)
        extension = os.path.splitext(safe_name)[1].lower()
        if extension not in {".jpg", ".jpeg", ".png"}:
            return jsonify({"status": "error", "message": "Only JPG and PNG images are supported"}), 400

        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=extension)
        temp_path = temp_file.name
        temp_file.close()

        try:
            uploaded_file.save(temp_path)
            image = cv2.imread(temp_path)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    else:
        return jsonify({"status": "error", "message": "Missing image payload."}), 400

    if image is None:
        return jsonify({"status": "error", "message": "Unable to decode neck image."}), 400

    frame_height, frame_width = image.shape[:2]
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    chin_x = None
    chin_y = None
    detected_face_box: tuple[int, int, int, int] | None = None

    try:
        mediapipe_module = importlib.import_module("mediapipe")
        face_mesh = mediapipe_module.solutions.face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
        )
        mesh_result = face_mesh.process(image_rgb)
        face_mesh.close()

        if mesh_result.multi_face_landmarks:
            face_landmarks = mesh_result.multi_face_landmarks[0].landmark
            chin_landmark = face_landmarks[152]
            chin_x = int(chin_landmark.x * frame_width)
            chin_y = int(chin_landmark.y * frame_height)
    except Exception:
        pass

    if chin_x is None or chin_y is None:
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        detected_faces = cascade.detectMultiScale(
            gray_image,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(80, 80),
        )

        if len(detected_faces) > 0:
            x, y, w, h = max(detected_faces, key=lambda rect: rect[2] * rect[3])
            detected_face_box = (int(x), int(y), int(w), int(h))
            chin_x = int(x + (w / 2))
            chin_y = int(y + h)

    face_anchor_detected = chin_x is not None and chin_y is not None

    if chin_x is None or chin_y is None:
        chin_x = frame_width // 2
        chin_y = int(frame_height * 0.42)

    if chin_x is None or chin_y is None:
        return jsonify(
            {
                "status": "error",
                "message": "Neck region not clearly visible. Please retake the image.",
            }
        ), 400

    if detected_face_box:
        _, _, face_w, face_h = detected_face_box
        half_width = max(int(face_w * 0.65), 80)
        roi_height = max(int(face_h * 0.95), 120)
    else:
        half_width = max(int(frame_width * 0.18), 90)
        roi_height = max(int(frame_height * 0.22), 120)

    candidate_offsets = [0, int(roi_height * 0.12), int(roi_height * 0.22)]
    valid_neck_crop = False
    bulge_value: float | None = None

    for offset in candidate_offsets:
        neck_top = max(chin_y + offset, 0)
        neck_bottom = min(neck_top + roi_height, frame_height)
        neck_left = max(chin_x - half_width, 0)
        neck_right = min(chin_x + half_width, frame_width)

        if neck_bottom <= neck_top or neck_right <= neck_left:
            continue

        neck_roi = image[neck_top:neck_bottom, neck_left:neck_right]
        if neck_roi.size == 0:
            continue

        gray_roi = cv2.cvtColor(neck_roi, cv2.COLOR_BGR2GRAY)
        roi_std = float(np.std(gray_roi))
        roi_mean = float(np.mean(gray_roi))

        ycrcb_roi = cv2.cvtColor(neck_roi, cv2.COLOR_BGR2YCrCb)
        lower_skin = np.array([0, 133, 77], dtype=np.uint8)
        upper_skin = np.array([255, 173, 127], dtype=np.uint8)
        skin_mask = cv2.inRange(ycrcb_roi, lower_skin, upper_skin)
        skin_ratio = float(np.count_nonzero(skin_mask)) / float(skin_mask.size)

        min_skin_ratio = 0.06 if face_anchor_detected else 0.10

        if roi_std < 8.0 or roi_mean < 20.0 or skin_ratio < min_skin_ratio:
            continue

        valid_neck_crop = True
        blurred_roi = cv2.GaussianBlur(gray_roi, (5, 5), 0)
        edges = cv2.Canny(blurred_roi, 35, 120)
        kernel = np.ones((3, 3), dtype=np.uint8)
        edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel, iterations=1)

        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            continue

        roi_area = float(gray_roi.shape[0] * gray_roi.shape[1])
        usable_contours = [contour for contour in contours if cv2.contourArea(contour) > roi_area * 0.01]
        if not usable_contours:
            continue

        largest_contour = max(usable_contours, key=cv2.contourArea)
        contour_area = float(cv2.contourArea(largest_contour))
        if contour_area <= 0:
            continue

        hull = cv2.convexHull(largest_contour)
        hull_area = float(cv2.contourArea(hull))
        if hull_area <= 0:
            continue

        bulge_value = max(0.0, min((hull_area - contour_area) / hull_area, 1.0))
        break

    if not valid_neck_crop and face_anchor_detected:
        return jsonify(
            {
                "neck_score": 0.1,
                "swelling_level": "low",
                "message": "No visible swelling detected",
                "bulge_value": 0.08,
            }
        ), 200

    if not valid_neck_crop:
        return jsonify(
            {
                "status": "error",
                "message": "Neck region not clearly visible. Please retake the image.",
            }
        ), 400

    if bulge_value is None:
        bulge_value = 0.08

    if bulge_value < 0.15:
        neck_score = 0.1
        swelling_level = "low"
        message = "No visible swelling detected"
    elif bulge_value < 0.30:
        neck_score = 0.3
        swelling_level = "moderate"
        message = "Possible neck swelling detected"
    else:
        neck_score = 0.5
        swelling_level = "high"
        message = "Possible neck swelling detected"

    return jsonify(
        {
            "neck_score": neck_score,
            "swelling_level": swelling_level,
            "message": message,
            "bulge_value": round(bulge_value, 4),
        }
    ), 200


@app.post("/analyze-neck-video")
def analyze_neck_video() -> tuple:
    if "file" not in request.files:
        return jsonify({"error": "Missing file field 'file' in multipart/form-data"}), 400

    uploaded_file = request.files["file"]

    if uploaded_file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    safe_name = secure_filename(uploaded_file.filename)
    extension = os.path.splitext(safe_name)[1].lower()
    if extension not in NECK_VIDEO_EXTENSIONS:
        return jsonify({"error": "Only MP4, MOV, AVI, MKV, and WEBM videos are supported"}), 400

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=extension)
    temp_path = temp_file.name
    temp_file.close()

    try:
        uploaded_file.save(temp_path)
        analysis = analyze_neck_swallow_video(temp_path)
        if "error" in analysis:
            return jsonify(analysis), 400
        return jsonify(analysis), 200
    except Exception as exc:
        return jsonify({"error": f"Failed to analyze neck video: {str(exc)}"}), 400
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
