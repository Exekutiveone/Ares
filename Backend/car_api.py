from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import os
import random

app = Flask(__name__)
CORS(app)

class Car:
    def __init__(self):
        self.speed = 0.0
        self.rpm = 0
        self.gyro = 0.0
        self.distances = {
            'front': 0,
            'rear': 0,
            'left': 0,
            'right': 0
        }

    def update_random(self):
        """Fill the fields with some random demo values."""
        self.speed = round(random.uniform(0, 30), 2)
        self.rpm = int(self.speed * 100)
        self.gyro = round(random.uniform(0, 360), 1)
        self.distances = {k: int(random.uniform(0, 150)) for k in self.distances}

    def update_from_dict(self, data):
        """Assign data from a dictionary to the car state."""
        self.speed = float(data.get('speed', self.speed))
        self.rpm = int(data.get('rpm', self.rpm))
        self.gyro = float(data.get('gyro', self.gyro))
        distances = data.get('distances', {})
        for k in self.distances.keys():
            if k in distances:
                self.distances[k] = int(distances[k])

car = Car()

@app.route('/api/car', methods=['GET'])
def get_car_data():
    return jsonify({
        'speed': car.speed,
        'rpm': car.rpm,
        'gyro': car.gyro,
        'distances': car.distances
    })


@app.route('/api/car', methods=['POST'])
def set_car_data():
    data = request.get_json() or {}
    required = ['speed', 'rpm', 'gyro', 'distances']
    if not all(k in data for k in required):
        return jsonify({'error': 'invalid payload'}), 400
    distances = data['distances']
    if not isinstance(distances, dict) or not all(k in distances for k in ['front', 'rear', 'left', 'right']):
        return jsonify({'error': 'invalid payload'}), 400
    try:
        car.update_from_dict(data)
    except (TypeError, ValueError):
        return jsonify({'error': 'invalid payload'}), 400
    return jsonify({'status': 'ok'})

@app.route('/api/video', methods=['GET'])
def get_video():
    """Stream dummy-video.mp4 if present."""
    directory = os.path.dirname(__file__)
    video_file = os.path.join(directory, 'dummy-video.mp4')
    if not os.path.isfile(video_file):
        return jsonify({'error': 'dummy-video.mp4 missing'}), 404
    return send_from_directory(directory, 'dummy-video.mp4', mimetype='video/mp4')

if __name__ == '__main__':
    # Bind to a dedicated IP instead of localhost
    app.run(host='192.168.56.103', port=5001, debug=True)
