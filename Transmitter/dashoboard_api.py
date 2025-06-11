from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import os

MAX_TOTAL_SPEED = 30

app = Flask(__name__)
CORS(app)

class Car:
    def __init__(self):
        self.speed = 0.0
        self.rpm = 0
        self.gyro = 0.0
        self.pos_x = 0.0
        self.pos_y = 0.0
        self.max_speed = MAX_TOTAL_SPEED
        self.distances = {
            'front': 0,
            'rear': 0,
            'left': 0,
            'right': 0
        }

    def set_from_data(self, data):
        self.speed = data.get('speed', self.speed)
        self.rpm = data.get('rpm', self.rpm)
        self.gyro = data.get('gyro', self.gyro)
        self.pos_x = data.get('pos_x', self.pos_x)
        self.pos_y = data.get('pos_y', self.pos_y)
        distances = data.get('distances')
        if isinstance(distances, dict):
            for k in ['front', 'rear', 'left', 'right']:
                if k in distances:
                    self.distances[k] = distances[k]

car = Car()

@app.route('/api/car', methods=['GET'])
def get_car_data():
    """Return the current car telemetry."""
    return jsonify({
        'speed': car.speed,
        'rpm': car.rpm,
        'gyro': car.gyro,
        'pos_x': car.pos_x,
        'pos_y': car.pos_y,
        'distances': car.distances
    })


@app.route('/api/car', methods=['POST'])
def car_data():
    try:
        data = request.get_json(force=True)
        if not isinstance(data, dict):
            return jsonify({'error': 'Invalid JSON structure'}), 400
        car.set_from_data(data)
        return jsonify({
            'speed': car.speed,
            'rpm': car.rpm,
            'gyro': car.gyro,
            'pos_x': car.pos_x,
            'pos_y': car.pos_y,
            'distances': car.distances
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/speed', methods=['GET', 'POST'])
def speed_limit():
    if request.method == 'GET':
        return jsonify({'max_speed': car.max_speed})
    data = request.get_json() or {}
    try:
        value = float(data.get('max_speed'))
    except (TypeError, ValueError):
        return jsonify({'error': 'invalid value'}), 400
    if value > MAX_TOTAL_SPEED:
        return jsonify({'error': 'exceeds limit'}), 400
    car.max_speed = value
    return jsonify({'max_speed': car.max_speed})

@app.route('/api/video', methods=['GET'])
def get_video():
    directory = os.path.dirname(__file__)
    video_file = os.path.join(directory, 'dummy-video.mp4')
    if not os.path.isfile(video_file):
        return jsonify({'error': 'dummy-video.mp4 missing'}), 404
    return send_from_directory(directory, 'dummy-video.mp4', mimetype='video/mp4')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
