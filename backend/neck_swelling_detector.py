from __future__ import annotations

import importlib
from pathlib import Path
from typing import Any

import cv2
import numpy as np


NO_NECK_MESSAGE = "Please retake the photo with the neck clearly visible."
MODEL_FILENAME = "neck_swelling_model.h5"
ROI_SIZE = (224, 224)


class NeckSwellingDetector:
    def __init__(self, model_path: str | Path | None = None) -> None:
        mediapipe_module = importlib.import_module("mediapipe")
        keras_models_module = importlib.import_module("tensorflow.keras.models")
        load_model = getattr(keras_models_module, "load_model")

        base_dir = Path(__file__).resolve().parent
        resolved_model_path = Path(model_path) if model_path else base_dir / MODEL_FILENAME
        self.model = load_model(str(resolved_model_path))
        self.face_mesh = mediapipe_module.solutions.face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
        )

    def _extract_neck_roi(self, image_bgr: np.ndarray) -> np.ndarray | None:
        image_height, image_width = image_bgr.shape[:2]
        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        result = self.face_mesh.process(image_rgb)

        if not result.multi_face_landmarks:
            return None

        face_landmarks = result.multi_face_landmarks[0].landmark

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

        jaw_points = []
        for landmark_index in jawline_indices:
            landmark = face_landmarks[landmark_index]
            point_x = int(landmark.x * image_width)
            point_y = int(landmark.y * image_height)
            jaw_points.append((point_x, point_y))

        jaw_x_values = [point[0] for point in jaw_points]
        jaw_y_values = [point[1] for point in jaw_points]

        min_jaw_x = max(min(jaw_x_values), 0)
        max_jaw_x = min(max(jaw_x_values), image_width)
        chin_y = min(max(jaw_y_values), image_height - 1)

        jaw_width = max_jaw_x - min_jaw_x
        if jaw_width <= 0:
            return None

        horizontal_padding = int(jaw_width * 0.12)
        neck_left = max(min_jaw_x - horizontal_padding, 0)
        neck_right = min(max_jaw_x + horizontal_padding, image_width)

        neck_top = min(chin_y + int(image_height * 0.03), image_height - 1)
        neck_height = max(int(jaw_width * 0.60), int(image_height * 0.18))
        neck_bottom = min(neck_top + neck_height, image_height)

        if neck_bottom <= neck_top or neck_right <= neck_left:
            return None

        neck_roi = image_bgr[neck_top:neck_bottom, neck_left:neck_right]
        if neck_roi.size == 0:
            return None

        return neck_roi

    def predict_from_image(self, image_bgr: np.ndarray) -> dict[str, Any]:
        neck_roi = self._extract_neck_roi(image_bgr)
        if neck_roi is None:
            return {"error": NO_NECK_MESSAGE}

        resized_roi = cv2.resize(neck_roi, ROI_SIZE, interpolation=cv2.INTER_AREA)
        normalized_roi = resized_roi.astype("float32") / 255.0
        input_tensor = np.expand_dims(normalized_roi, axis=0)

        prediction = self.model.predict(input_tensor, verbose=0)
        prediction_array = np.asarray(prediction).squeeze()

        neck_score: int
        confidence: float

        if np.isscalar(prediction_array) or prediction_array.ndim == 0:
            swelling_probability = float(prediction_array)
            neck_score = 1 if swelling_probability >= 0.5 else 0
            confidence = swelling_probability if neck_score == 1 else (1.0 - swelling_probability)
        else:
            flattened = prediction_array.flatten()
            if flattened.size == 1:
                swelling_probability = float(flattened[0])
                neck_score = 1 if swelling_probability >= 0.5 else 0
                confidence = swelling_probability if neck_score == 1 else (1.0 - swelling_probability)
            else:
                predicted_index = int(np.argmax(flattened))
                neck_score = 1 if predicted_index == 1 else 0
                confidence = float(flattened[predicted_index])

        return {
            "neck_result": "Possible Neck Swelling" if neck_score == 1 else "Normal",
            "confidence": float(round(confidence, 4)),
            "neck_score": neck_score,
        }


def analyze_neck_photo(image_path: str | Path, model_path: str | Path | None = None) -> dict[str, Any]:
    detector = NeckSwellingDetector(model_path=model_path)
    image_bgr = cv2.imread(str(image_path))

    if image_bgr is None:
        return {"error": "Unable to load image file."}

    return detector.predict_from_image(image_bgr)
