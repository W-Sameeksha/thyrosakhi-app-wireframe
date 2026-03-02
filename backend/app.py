import os
import tempfile

import librosa
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename


app = Flask(__name__)
CORS(app)

LOW_PITCH_HZ = 160.0
PITCH_VARIATION_THRESHOLD = 35.0
LOW_ENERGY_THRESHOLD = 0.04


def parse_bool_field(field_name: str) -> bool:
    raw_value = request.form.get(field_name)
    if raw_value is None:
        raise ValueError(f"Missing form-data field '{field_name}'")

    normalized = raw_value.strip().lower()
    truthy = {"true", "1", "yes", "on"}
    falsy = {"false", "0", "no", "off"}

    if normalized in truthy:
        return True
    if normalized in falsy:
        return False

    raise ValueError(
        f"Invalid boolean value for '{field_name}'. Use true/false."
    )


def get_risk_level(risk_score: int) -> str:
    if risk_score <= 1:
        return "Low"
    if risk_score == 2:
        return "Moderate"
    return "High"


def parse_coordinate(field_name: str) -> float:
    raw_value = request.form.get(field_name)
    if raw_value is None:
        raise ValueError(f"Missing form-data field '{field_name}'")

    try:
        return float(raw_value)
    except ValueError as exc:
        raise ValueError(f"Invalid numeric value for '{field_name}'") from exc


def get_dietary_recommendations(
    average_pitch: float,
    energy: float,
) -> list[str]:
    hypothyroid_like = average_pitch < LOW_PITCH_HZ or energy < LOW_ENERGY_THRESHOLD

    if hypothyroid_like:
        return [
            "Include iodine-rich foods (iodized salt, dairy)",
            "Add selenium sources like nuts and seeds",
            "Increase high-fiber vegetables",
            "Avoid excessive processed foods",
        ]

    return [
        "Maintain balanced calorie intake",
        "Include protein-rich foods",
        "Limit caffeine",
        "Stay hydrated",
    ]


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

    try:
        fatigue = parse_bool_field("fatigue")
        weight_gain = parse_bool_field("weight_gain")
        hair_fall = parse_bool_field("hair_fall")
        latitude = parse_coordinate("latitude")
        longitude = parse_coordinate("longitude")
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

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

        rms = librosa.feature.rms(y=audio_data)[0]
        energy = float(np.mean(rms)) if rms.size > 0 else 0.0
        duration = float(librosa.get_duration(y=audio_data, sr=sample_rate))

        risk_score = 0
        if average_pitch < LOW_PITCH_HZ:
            risk_score += 1
        if pitch_variation > PITCH_VARIATION_THRESHOLD:
            risk_score += 1
        if energy < LOW_ENERGY_THRESHOLD:
            risk_score += 1

        risk_level = get_risk_level(risk_score)
        response_data = {
            "average_pitch": round(average_pitch, 2),
            "pitch_variation": round(pitch_variation, 2),
            "energy": round(energy, 4),
            "duration": round(duration, 2),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "latitude": round(latitude, 6),
            "longitude": round(longitude, 6),
        }

        if risk_level == "Moderate":
            response_data["dietary_recommendations"] = get_dietary_recommendations(
                average_pitch=average_pitch,
                energy=energy,
            )

        return (
            jsonify(response_data),
            200,
        )
    except Exception as exc:
        return jsonify({"error": f"Failed to analyze audio: {str(exc)}"}), 400
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
