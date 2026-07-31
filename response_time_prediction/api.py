"""
Minimal REST API wrapping the trained model so CrisisConnect's
JavaScript frontend can call it via fetch().

Run from inside the response_time_prediction folder:
    python api.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import predict_response_time

app = Flask(__name__)
CORS(app)  # allows dashboard.html (different origin/port) to call this API

@app.route("/predict", methods=["POST"])
def predict():
    try:
        features = request.get_json()
        required = ["distance_km", "traffic_level", "road_type",
                    "weather_severity", "time_of_day", "resource_type"]
        missing = [f for f in required if f not in features]
        if missing:
            return jsonify({"error": f"Missing fields: {missing}"}), 400

        result = predict_response_time(features)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)