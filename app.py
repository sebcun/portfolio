from flask import Flask, render_template, jsonify
import json
import random

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/contents')
def getContents():
    with open('contents.json', 'r') as f:
        data = json.load(f)
    return jsonify(data), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)