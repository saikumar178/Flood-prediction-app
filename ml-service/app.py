from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load the trained model
model = joblib.load("model.pkl")


@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    try:
        rainfall = float(data.get('rainfall', 0))
        temperature = float(data.get('temperature', 0))
        humidity = float(data.get('humidity', 0))
        elevation = float(data.get('elevation', 0))
        month = int(data.get('month', 1))

        features = np.array([[rainfall, temperature, humidity, elevation, month]])
        prediction = model.predict(features)[0]
        proba = model.predict_proba(features)[0][1]

        result = {
            "prediction": "Flood Likely" if prediction == 1 else "No Flood",
            "probability": round(float(proba), 3)
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
