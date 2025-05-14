from flask import Flask, request, jsonify, send_from_directory
import pickle
import pandas as pd
from feature_extraction import ExtractFeatures
import traceback
import os

app = Flask(__name__, static_folder='static')

# Load trained model
try:
    with open('waf_model.pkl', 'rb') as f:
        model = pickle.load(f)
    print("✅Model loaded successfully")
except Exception as e:
    print(f"❌ Error loading model: {str(e)}")
    model = None

# Serve index.html at root
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

# Serve static files
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if not model:
            return jsonify({'error': 'Model not loaded'}), 500
            
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400
            
        path = data.get('path', '')
        body = data.get('body', '')
        
        print(f"Received request - Path: {path}, Body: {body}")
        
        features = ExtractFeatures(path, body)
        print(f"Extracted features: {features}")
        
        features_df = pd.DataFrame([features])
        print(f"Features DataFrame:\n{features_df}")
        
        prediction = model.predict(features_df)[0]
        print(f"Prediction: {prediction}")

        return jsonify({
            'prediction': int(prediction),
            'features': features  # Return features for frontend display
        })
        
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Create static directory if it doesn't exist
    if not os.path.exists('static'):
        os.makedirs('static')
    
    app.run(debug=True)