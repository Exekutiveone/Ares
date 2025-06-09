from flask import Flask, request, jsonify
import psycopg2
import uuid
import json
import os

app = Flask(__name__)


def get_conn():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME", "ares"),
        user=os.getenv("DB_USER", "ares"),
        password=os.getenv("DB_PASSWORD", "ares"),
    )


@app.route('/api/maps', methods=['POST'])
def save_map():
    data = request.get_json()
    if not data or 'name' not in data or 'map' not in data:
        return jsonify({'error': 'invalid payload'}), 400
    conn = get_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                "INSERT INTO maps (id, name, data) VALUES (%s, %s, %s)",
                (str(uuid.uuid4()), data['name'], json.dumps(data['map']))
            )
        return jsonify({'status': 'ok'})
    finally:
        conn.close()


if __name__ == '__main__':
    app.run(debug=True)
