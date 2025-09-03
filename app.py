from flask import Flask, render_template, jsonify, request, session
import json, math, random

app = Flask(__name__)
app.secret_key = "PLACEHOLDER_KEY"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/contents', methods=["GET"])
def getContents():
    with open('contents.json', 'r') as f:
        data = json.load(f)
    return jsonify(data), 200

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    password = data.get('password', '').lower()
    if password == 'password':
        session['admin'] = True
        return jsonify({'success': True}), 200
    return jsonify({'success': False}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('admin', None)
    return jsonify({'success': True}), 200

@app.route('/api/createplanet', methods=["POST"])
def createPlanet():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400
    
    name = data.get('name')
    content = data.get('content')
    image = data.get('image')
    galaxyName = data.get('galaxy')

    if not name or not content or not image or not galaxyName:
        return jsonify({"error": "Missing required fields: name, content, image, galaxy"}), 400
    
    with open('contents.json', 'r') as f:
        contents = json.load(f)

    if not contents:
        return jsonify({"error": "No contents found"}), 400
    
    targetGalaxy = None
    for galaxy in contents:
        if galaxy.get('name') == galaxyName:
            targetGalaxy = galaxy
            break


    angle = random.uniform(0, 2* math.pi)
    radius = random.randint(200, 1000)
    x = int(radius * math.cos(angle))
    y = int(radius * math.sin(angle))
    size = random.randint(100, 200)
    color = "#{:06x}".format(random.randint(0, 0xFFFFFF))

    planet = {
        "item": "planet",
        "image": "earth",
        "x": x,
        "y": y,
        "size": size,
        "color": color,
        "type": "panel",
        "name": name,
        "contents": content
    }

    targetGalaxy['contents'].append(planet)

    try:
        with open('contents.json', 'w') as f:
            json.dump(contents, f, indent=2)
    except Exception as e:
        return jsonify({"error": f"Failed to save: {str(e)}"}), 500
    
    return jsonify({"planet": planet}), 201
        

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)