from flask import Flask, request, jsonify
from flask_cors import CORS

MAX_TOTAL_SPEED = 30

app = Flask(__name__)
CORS(app)

class CarController:
    """Placeholder controller that would talk to the real vehicle."""
    def __init__(self):
        self.last_action = None
        self.max_speed = MAX_TOTAL_SPEED
        # keep a short history so advanced maneuvers can be processed later
        self.history = []

    def execute(self, action: str):
        # Integration with actual car hardware would happen here.
        # Record the action for potential processing
        self.last_action = action
        self.history.append(action)
        # Advanced maneuvers could trigger special routines here
        if action in {
            'align_left', 'align_right', 'align_up', 'align_down',
            'curve_left', 'curve_right', 'circle'
        }:
            # Placeholder for servo or steering control logic
            pass

controller = CarController()

VALID_ACTIONS = {
    'forward': 'forward',
    'backward': 'backward',
    'left': 'left',
    'right': 'right',
    'stop': 'stop',
    # allow arrow style synonyms
    'up': 'forward',
    'down': 'backward',
    # additional maneuvers
    'align_left': 'align_left',
    'align_right': 'align_right',
    'align_up': 'align_up',
    'align_down': 'align_down',
    'curve_left': 'curve_left',
    'curve_right': 'curve_right',
    'circle': 'circle',
}

@app.route('/api/control', methods=['POST'])
def control_car():
    data = request.get_json() or {}
    raw_action = data.get('action')
    action = VALID_ACTIONS.get(raw_action)
    if action is None:
        return jsonify({'error': 'invalid action'}), 400
    controller.execute(action)
    return jsonify({'status': 'ok', 'action': controller.last_action})


@app.route('/api/control', methods=['GET'])
def get_last_action():
    """Return the last control command that was sent."""
    return jsonify({'action': controller.last_action})


@app.route('/api/speed', methods=['GET', 'POST'])
def speed_limit():
    if request.method == 'GET':
        return jsonify({'max_speed': controller.max_speed})
    data = request.get_json() or {}
    try:
        value = float(data.get('max_speed'))
    except (TypeError, ValueError):
        return jsonify({'error': 'invalid value'}), 400
    if value > MAX_TOTAL_SPEED:
        return jsonify({'error': 'exceeds limit'}), 400
    controller.max_speed = value
    return jsonify({'max_speed': controller.max_speed})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)

