from flask import Flask, request, jsonify

app = Flask(__name__)

# TODO: In the future, you will load your saved model file here
# import joblib
# model = joblib.load('model.pkl')


@app.route('/predict', methods=['POST'])
def predict():
    # Get the data from the POST request sent by the Express server
    data = request.get_json()
    
    # Print the data to the terminal for debugging
    print(f"Received data for prediction: {data}")
    
    # --- MOCK PREDICTION LOGIC ---
    # This is a placeholder. Here, you would normally process the data
    # and feed it to your loaded model like: `prediction = model.predict(processed_data)`
    
    # For now, we'll return a fake result based on the rainfall
    try:
        rainfall = data.get('rainfall', 0)
        if rainfall > 50:
            mock_result = {
                "prediction": "Flood Likely",
                "probability": 0.85
            }
        else:
            mock_result = {
                "prediction": "No Flood Expected",
                "probability": 0.15
            }
        return jsonify(mock_result)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An error occurred during prediction."}), 500


if __name__ == '__main__':
    # Runs the app on port 5000
    app.run(debug=True)
