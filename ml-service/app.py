from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# ✅ Load ML model
model = joblib.load("model.pkl")


@app.route('/', methods=['GET'])
def hello():
    return 'Nothing Found'


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        rainfall = float(data.get("rainfall"))
        river_level = float(data.get("river_level"))
        temp = float(data.get("temperature"))
        humidity = float(data.get("humidity"))

        features = np.array([[rainfall, river_level, temp, humidity]])
        prediction = model.predict(features)[0]
        proba = model.predict_proba(features)[0][1]

        return jsonify({
            "prediction": "Flood Likely" if prediction == 1 else "No Flood",
            "probability": round(float(proba), 4)
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
