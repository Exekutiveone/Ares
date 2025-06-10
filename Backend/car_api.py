from flask import Flask, jsonify, send_from_directory
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

    def update(self):
        """Fill the fields with some random demo values."""
        self.speed = round(random.uniform(0, 30), 2)
        self.rpm = int(self.speed * 100)
        self.gyro = round(random.uniform(0, 360), 1)
        self.distances = {k: int(random.uniform(0, 150)) for k in self.distances}

car = Car()

@app.route('/api/car', methods=['GET'])
def get_car_data():
    car.update()
    return jsonify({
        'speed': car.speed,
        'rpm': car.rpm,
        'gyro': car.gyro,
        'distances': car.distances
    })

@app.route('/api/video', methods=['GET'])
def get_video():
    """Stream dummy-video.mp4 if present."""
    directory = os.path.dirname(__file__)
    video_file = os.path.join(directory, 'dummy-video.mp4')
    if not os.path.isfile(video_file):
        return jsonify({'error': 'dummy-video.mp4 missing'}), 404
    return send_from_directory(directory, 'dummy-video.mp4', mimetype='video/mp4')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
