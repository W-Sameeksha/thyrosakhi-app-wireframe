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


def calculate_final_risk(voice_score: float, symptom_score: float, neck_score: float) -> tuple[float, str]:
    voice_weight = (voice_score / 3) * 0.40
    symptom_weight = (symptom_score / 3) * 0.35
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

    try:
        voice_score = float(data.get("voice_score"))
        symptom_score = float(data.get("symptom_score"))
        neck_score = float(data.get("neck_score"))
    except (TypeError, ValueError):
        return jsonify(
            {
                "error": "voice_score, symptom_score, and neck_score must be numeric values"
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

        f0, _, _ = librosa.pyin(
            audio_data,
            fmin=librosa.note_to_hz("C2"),
            fmax=librosa.note_to_hz("C7"),
        )
        voiced_f0 = f0[~np.isnan(f0)]

        if voiced_f0.size > 0:
            average_pitch = float(np.mean(voiced_f0))
            pitch_variation = float(np.std(voiced_f0))
        else:
            average_pitch = 0.0
            pitch_variation = 0.0

        return jsonify(
            {
                "average_pitch": average_pitch,
                "pitch_variation": pitch_variation,
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

        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
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

        diff_image = cv2.absdiff(left_half, right_flipped)
        mean_difference = float(np.mean(diff_image))
        asymmetry_flag = mean_difference > ASYMMETRY_THRESHOLD

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
                "symmetry_score": round(mean_difference, 2),
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
