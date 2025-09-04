from flask import Flask, render_template, jsonify, request, session
from dotenv import load_dotenv
import json, math, random, os, datetime


load_dotenv()


app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "Replace-With-Secret-Key")

rateLimits = {}

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
    if password == os.getenv("ADMIN_PASSWORD", "password"):
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
    xPos = data.get('x')
    yPos = data.get('y')
    size = data.get('size')

    if not name or not content or not image or not galaxyName:
        return jsonify({"error": "Missing required fields: name, content, image, galaxy"}), 400
    
    if galaxyName != "Public" and not session.get('admin'):
        return jsonify({"error": "Unauthorized"}), 403
    
    if (xPos or yPos or size) and not session.get('admin'):
        return jsonify({"error": "Unauthorized"}), 403
    
    with open('contents.json', 'r') as f:
        contents = json.load(f)

    if not contents:
        return jsonify({"error": "No contents found"}), 400
    
    if not session.get('admin'):
        ip = request.remote_addr
        now = datetime.datetime.now()
        lastTimeStr = rateLimits.get(ip)
        if lastTimeStr:
            lastTime = datetime.datetime.fromisoformat(lastTimeStr)
            if (now - lastTime).total_seconds() < 1800:
                return jsonify({"error": "30 mins between each planet"}), 429
    
    targetGalaxy = None
    for galaxy in contents:
        if galaxy.get('name') == galaxyName:
            targetGalaxy = galaxy
            break

    if not targetGalaxy:
        return jsonify({"error": "Target galaxy not found"}), 400

    angle = random.uniform(0, 2* math.pi)
    radius = random.randint(200, 1000)

    if not xPos:
        xPos = int(radius * math.cos(angle))
    if not yPos:
        yPos = int(radius * math.sin(angle))

    if size:
        sizeMap = {
            "size-xs": 100,
            "size-s": 175,
            "size-m": 250,
            "size-l": 300,
            "size-xl": 400
        }
        size = sizeMap.get(size, 150)
    else:
        size = random.randint(100, 200)
        
    color = "#{:06x}".format(random.randint(0, 0xFFFFFF))

    planet = {
        "targetGalaxy": targetGalaxy['name'],
        "item": "planet",
        "image": image,
        "x": int(xPos),
        "y": int(yPos),
        "size": size,
        "color": color,
        "type": "panel",
        "name": name,
        "author": request.remote_addr,
        "contents": content
    }

    if session.get('admin'):
        targetGalaxy['contents'].append(planet)

        try:
            with open('contents.json', 'w') as f:
                json.dump(contents, f, indent=2)
        except Exception as e:
            return jsonify({"error": f"Failed to save: {str(e)}"}), 500
        
        return jsonify({"planet": planet}), 201
    else:
        with open('pending.json', 'r') as f:
            approveContents = json.load(f)
        approveContents.append(planet)
        try:
            with open('pending.json', 'w') as f:
                json.dump(approveContents, f, indent=2)
        except Exception as e:
            return jsonify({"error": f"Failed to save: {str(e)}"}), 500
        
        ip = request.remote_addr
        now = datetime.datetime.now()
        rateLimits[ip] = now.isoformat()
        
        return jsonify({"planet": planet}), 201

@app.route('/api/pendingplanets', methods=["GET"])
def getPendingPlanets():
    if not session.get('admin'):
        return jsonify({"error": "Unauthorized"}), 403
    
    with open('pending.json', 'r') as f:
        data = json.load(f)
    return jsonify(data), 200

@app.route('/api/approveplanet', methods=['POST'])
def approvePlanet():
    if not session.get('admin'):
        return jsonify({"error": "Unauthorized"}), 403
    
    with open('pending.json', 'r') as f:
        pending = json.load(f)
    
    planet = pending.pop(0)

    if 'author' in planet:
        del planet['author']

    with open('contents.json', 'r') as f:
        contents = json.load(f)

    targetGalaxy = None
    for galaxy in contents:
        if galaxy.get('name') == planet['targetGalaxy']:
            targetGalaxy = galaxy
            break

    if not targetGalaxy:
        return jsonify({"error": "Target galaxy not found"}), 400
    
    targetGalaxy['contents'].append(planet)
    try:
        with open('pending.json', 'w') as f:
            json.dump(pending, f, indent=2)
        with open('contents.json', 'w') as f:
            json.dump(contents, f, indent=2)
    except Exception as e:
        return jsonify({"error": f"Failed to save: {str(e)}"}), 500
    
    return jsonify({"success": True}), 200

@app.route('/api/denyplanet', methods=['POST'])
def denyPlanet():
    if not session.get('admin'):
        return jsonify({"error": "Unauthorized"}), 403
    
    with open('pending.json', 'r') as f:
        pending = json.load(f)
    
    planet = pending.pop(0)

    try:
        with open('pending.json', 'w') as f:
            json.dump(pending, f, indent=2)
    except Exception as e:
        return jsonify({"error": f"Failed to save: {str(e)}"}), 500
    
    return jsonify({"success": True}), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)