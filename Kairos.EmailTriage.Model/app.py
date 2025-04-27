from flask import Flask, request, jsonify
from config.config import DefaultConfig as APP_CONFIG
from classification_model.trainer import train_model, load_model
from utils.preprocess import clean_text
import os

app = Flask(__name__)

@app.route('/api/train', methods=['POST'])
def train():
    try:
        model, vector = train_model()
        return jsonify({"status": "Model trained successfully."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        text = clean_text(data['text'])
        id = data.get('id', None)

        if not text:
            return jsonify({"error": "No text provided."}), 400
        
        model, vector = load_model()

        text_vec = vector.transform([text])
        prediction = model.predict(text_vec)[0]
        prediction_score = round(max(model.predict_proba(text_vec)[0]) * 10, 2)

        return jsonify({"prediction": prediction, "score": prediction_score, "id": id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=APP_CONFIG.PORT)
