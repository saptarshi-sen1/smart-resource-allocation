"""
Inference helper for emergency dispatch response-time prediction.

Run from inside the response_time_prediction folder:
    python predict.py
"""

import joblib
import pandas as pd

# ---------------------------------------------------------------------------
# Load artifacts once at module import time so repeated calls don't
# re-read the .pkl files from disk.
# ---------------------------------------------------------------------------
MODEL_PATH = "./model/response_time_model.pkl"
FEATURE_COLUMNS_PATH = "./model/feature_columns.pkl"

model = joblib.load(MODEL_PATH)
feature_columns = joblib.load(FEATURE_COLUMNS_PATH)

CATEGORICAL_COLUMNS = ["road_type", "resource_type"]


def predict_response_time(features: dict) -> dict:
    """
    Predict response time (minutes) for a single incident.

    Parameters
    ----------
    features : dict
        Keys: distance_km, traffic_level, road_type, weather_severity,
        time_of_day, resource_type.

    Returns
    -------
    dict
        {"predicted_minutes": float, "confidence_interval": [low, high]}
    """
    # Convert the input dict into a single-row DataFrame.
    raw_df = pd.DataFrame([features])

    # One-hot encode categoricals the same way training did (pd.get_dummies).
    # A single-row input only produces columns for the categories present,
    # e.g. road_type="urban" yields road_type_urban but NOT road_type_highway.
    encoded = pd.get_dummies(raw_df, columns=CATEGORICAL_COLUMNS, dtype=int)

    # Reindex is critical: the model expects the EXACT feature order and set
    # of columns it was trained on (saved in feature_columns.pkl).
    # Without this step, missing one-hot columns would cause a shape/order
    # mismatch — a very common training-vs-inference bug that silently
    # produces wrong predictions or crashes.
    # fill_value=0 marks absent categories as "not this category".
    X = encoded.reindex(columns=feature_columns, fill_value=0)

    print("DEBUG — final feature matrix (before model.predict):")
    print(X.to_string())

    value = float(model.predict(X)[0])

    return {
        "predicted_minutes": round(value, 2),
        "confidence_interval": [round(value - 1.5, 2), round(value + 1.5, 2)],
    }


if __name__ == "__main__":
    sample = {
        "distance_km": 12.5,
        "traffic_level": 2,
        "road_type": "urban",
        "weather_severity": 6.0,
        "time_of_day": 18,
        "resource_type": "ambulance",
    }

    result = predict_response_time(sample)
    print("Sample input:")
    print(sample)
    print()
    print("Prediction:")
    print(result)
