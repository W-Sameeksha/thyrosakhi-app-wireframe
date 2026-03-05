import os
import tempfile

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


def calculate_final_risk(voice_score: float, symptom_score: float, neck_score: float) -> tuple[float, str]:
    voice_weight = (voice_score / 3) * 0.40
    symptom_weight = (symptom_score / 5) * 0.35
    neck_weight = (neck_score / 2) * 0.25

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
            return jsonify({"error": "Failed to load neck image"}), 400

        resized_image = cv2.resize(image, (256, 256), interpolation=cv2.INTER_AREA)

        crop_width = int(256 * 0.40)
        crop_start = (256 - crop_width) // 2
        crop_end = crop_start + crop_width
        center_region = resized_image[:, crop_start:crop_end]

        if center_region.size == 0:
            return jsonify({"error": "Failed to isolate center neck region"}), 400

        hsv_image = cv2.cvtColor(center_region, cv2.COLOR_BGR2HSV)
        lower_skin_1 = np.array([0, 15, 30], dtype=np.uint8)
        upper_skin_1 = np.array([35, 255, 255], dtype=np.uint8)
        lower_skin_2 = np.array([160, 15, 30], dtype=np.uint8)
        upper_skin_2 = np.array([179, 255, 255], dtype=np.uint8)

        mask_1 = cv2.inRange(hsv_image, lower_skin_1, upper_skin_1)
        mask_2 = cv2.inRange(hsv_image, lower_skin_2, upper_skin_2)
        skin_mask = cv2.bitwise_or(mask_1, mask_2)

        kernel = np.ones((3, 3), np.uint8)
        skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel)
        skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_CLOSE, kernel)

        skin_pixel_count = int(np.count_nonzero(skin_mask))
        if skin_pixel_count == 0:
            fallback_lower = np.array([0, 0, 20], dtype=np.uint8)
            fallback_upper = np.array([179, 255, 255], dtype=np.uint8)
            skin_mask = cv2.inRange(hsv_image, fallback_lower, fallback_upper)
            skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel)
            skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_CLOSE, kernel)
            skin_pixel_count = int(np.count_nonzero(skin_mask))

        if skin_pixel_count < DETECTED_SKIN_PIXEL_THRESHOLD:
            return jsonify({"error": "Image unclear, please retake the photo"}), 400

        masked_region = cv2.bitwise_and(center_region, center_region, mask=skin_mask)
        gray_image = cv2.cvtColor(masked_region, cv2.COLOR_BGR2GRAY)
        equalized_image = cv2.equalizeHist(gray_image)

        blurred_image = cv2.GaussianBlur(equalized_image, (5, 5), 0)
        edges = cv2.Canny(blurred_image, 50, 150)

        height, width = equalized_image.shape
        half_width = width // 2

        if half_width == 0:
            return jsonify({"error": "Image is too narrow for symmetry analysis"}), 400

        left_half = equalized_image[:, :half_width]
        right_half = equalized_image[:, width - half_width :]
        right_flipped = cv2.flip(right_half, 1)

        left_mask = skin_mask[:, :half_width]
        right_mask = skin_mask[:, width - half_width :]
        right_mask_flipped = cv2.flip(right_mask, 1)
        valid_mask = cv2.bitwise_and(left_mask, right_mask_flipped)

        valid_pixels = valid_mask > 0
        if not np.any(valid_pixels):
            return jsonify({"error": "Insufficient skin overlap for symmetry analysis"}), 400

        absolute_difference = np.abs(left_half.astype(np.float32) - right_flipped.astype(np.float32))
        mean_difference = float(np.mean(absolute_difference[valid_pixels]))
        symmetry_score = mean_difference / 255.0

        if symmetry_score < 0.08:
            neck_risk = 0
        elif symmetry_score < 0.18:
            neck_risk = 1
        else:
            neck_risk = 2

        asymmetry_flag = neck_risk >= 1

        upper_width = max_horizontal_width_in_band(edges, 0, height // 3)
        middle_width = max_horizontal_width_in_band(edges, height // 3, (2 * height) // 3)
        lower_width = max_horizontal_width_in_band(edges, (2 * height) // 3, height)

        swelling_flag = (
            middle_width > upper_width * 1.1 and middle_width > lower_width * 1.1
        )

        if asymmetry_flag or swelling_flag:
            image_result = (
                "Visible structural irregularity detected in neck region. "
                "Clinical evaluation recommended."
            )
        else:
            image_result = (
                "No visible external irregularity detected. "
                "This does not rule out thyroid conditions."
            )

        return jsonify(
            {
                "symmetry_score": round(symmetry_score, 4),
                "neck_risk": neck_risk,
                "visible_asymmetry": asymmetry_flag,
                "swelling_flag": swelling_flag,
                "image_result": image_result,
            }
        ), 200
    except Exception as exc:
        return jsonify({"error": f"Failed to analyze neck image: {str(exc)}"}), 400
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
