from flask import Flask, request, jsonify
import random

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json() or {}
    media_url = data.get('url')
    media_type = data.get('type', 'image')

    # Dummy ML: generate random detection results
    results = {
        'count': random.randint(0, 5),
        'severity': random.choice(['low', 'medium', 'high']),
        'confidence': random.randint(60, 99),
        'media_url': media_url,
        'media_type': media_type
    }

    return jsonify(results)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
