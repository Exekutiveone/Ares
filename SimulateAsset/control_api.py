from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

class CarController:
    """Placeholder controller that would talk to the real vehicle."""

    def __init__(self):
        self.keys = {k: False for k in ['up', 'down', 'left', 'right']}

    def set_single_action(self, action: str):
        """Set only one key based on a legacy action value."""
        mapping = {
            'forward': 'up',
            'backward': 'down',
            'left': 'left',
            'right': 'right',
            'stop': None,
            # allow arrow style synonyms
            'up': 'up',
            'down': 'down',
        }
        key = mapping.get(action)
        if key is None and action != 'stop':
            return False
        for k in self.keys:
            self.keys[k] = (k == key) if key else False
        return True

    def update_keys(self, updates: dict):
        """Update multiple key states."""
        for k, v in updates.items():
            if k in self.keys:
                self.keys[k] = bool(v)
        return True

    def get_state(self):
        return self.keys

controller = CarController()

VALID_ACTIONS = {
    'forward', 'backward', 'left', 'right', 'stop', 'up', 'down'
}

@app.route('/api/control', methods=['POST'])
def control_car():
    data = request.get_json() or {}
    # new multi-key interface
    if isinstance(data.get('keys'), dict):
        controller.update_keys(data['keys'])
        return jsonify({'status': 'ok', 'keys': controller.get_state()})

    raw_action = data.get('action')
    if raw_action not in VALID_ACTIONS:
        return jsonify({'error': 'invalid action'}), 400
    if not controller.set_single_action(raw_action):
        return jsonify({'error': 'invalid action'}), 400
    return jsonify({'status': 'ok', 'keys': controller.get_state()})


@app.route('/api/control', methods=['GET'])
def get_keys():
    """Return the current key state."""
    return jsonify({'keys': controller.get_state()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)

