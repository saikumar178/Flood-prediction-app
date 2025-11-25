from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import uvicorn
import os


class PredictionRequest(BaseModel):
    rainfall: float = 0.0
    temperature: float = 0.0
    humidity: float = 0.0
    elevation: float = 0.0
    month: int = 1


app = FastAPI()


try:
    if not os.path.exists("model.pkl"):
        # Check for model file
        raise FileNotFoundError("model.pkl is missing.")
    model = joblib.load("model.pkl")
    print("Model loaded successfully.")
except Exception as e:
    print(f"CRITICAL ERROR: Failed to load model.pkl: {e}")
    model = None


@app.post('/predict')
def predict(data: PredictionRequest):
    """
    Accepts environmental data via POST and returns the flood prediction.
    'data' is automatically validated by Pydantic.
    """
    # Check if the model is available
    if model is None:
        raise HTTPException(status_code=503, detail="Model service unavailable. Failed to load model.pkl.")

    try:
        # Extract features from the validated Pydantic object
        features = np.array([[
            data.rainfall,
            data.temperature,
            data.humidity,
            data.elevation,
            data.month
        ]])

        prediction = model.predict(features)[0]
        # Assuming the positive class (Flood Likely) is index 1
        proba = model.predict_proba(features)[0][1]

        result = {
            "prediction": "Flood Likely" if prediction == 1 else "No Flood",
            "probability": round(float(proba), 3)
        }
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e)})


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
