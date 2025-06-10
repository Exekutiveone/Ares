from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import math

app = Flask(__name__)
CORS(app)

class Car:
    def __init__(self, game_map):
        self.map = game_map
        self.x = game_map.get('start', {}).get('x', 0)
        self.y = game_map.get('start', {}).get('y', 0)
        self.angle = 0.0  # radians
        self.speed = 2.0
        self.rpm = 0
        self.gyro = 0.0
        self.distances = {
            'front': 0,
            'rear': 0,
            'left': 0,
            'right': 0
        }

    def cast_ray(self, angle, max_len=150, step=5):
        width = self.map['width']
        height = self.map['height']
        obstacles = self.map.get('obstacles', [])
        dx = math.cos(angle)
        dy = math.sin(angle)
        for i in range(0, max_len + 1, step):
            px = self.x + dx * i
            py = self.y + dy * i
            if px < 0 or py < 0 or px >= width or py >= height:
                return i
            for obs in obstacles:
                if (obs['x'] <= px <= obs['x'] + obs['w'] and
                        obs['y'] <= py <= obs['y'] + obs['h']):
                    return i
        return max_len

    def update(self):
        # Compute sensor distances
        self.distances['front'] = self.cast_ray(self.angle)
        self.distances['rear'] = self.cast_ray(self.angle + math.pi)
        self.distances['left'] = self.cast_ray(self.angle - math.pi / 2)
        self.distances['right'] = self.cast_ray(self.angle + math.pi / 2)

        # Move car and rotate on collision
        if self.distances['front'] > self.speed:
            self.x += math.cos(self.angle) * self.speed
            self.y += math.sin(self.angle) * self.speed
        else:
            # simple behavior: turn right when hitting obstacle or border
            self.angle += math.pi / 2

        self.gyro = (math.degrees(self.angle) % 360)
        self.rpm = int(self.speed * 100)

map_file = os.path.join(os.path.dirname(__file__), 'sample_map.json')
with open(map_file, 'r') as f:
    game_map = json.load(f)

car = Car(game_map)

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
