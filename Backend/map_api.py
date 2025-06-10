from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import uuid
import json

app = Flask(__name__)
CORS(app)

def get_conn():
    return psycopg2.connect(
        host="192.168.178.147",
        port="5432",
        dbname="ares",
        user="ares",
        password="ares"
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


@app.route('/api/maps', methods=['GET'])
def list_maps():
    conn = get_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute("SELECT id, name, created_at FROM maps ORDER BY created_at DESC")
            rows = cur.fetchall()
            maps = [{"id": str(r[0]), "name": r[1], "created_at": r[2].isoformat()} for r in rows]
        return jsonify(maps)
    finally:
        conn.close()


@app.route('/api/maps/<map_id>', methods=['GET'])
def get_map(map_id):
    conn = get_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute("SELECT data FROM maps WHERE id = %s", (map_id,))
            row = cur.fetchone()
            if row:
                return jsonify(row[0])
            else:
                return jsonify({"error": "not found"}), 404
    finally:
        conn.close()


@app.route('/api/maps/<map_id>', methods=['DELETE'])
def delete_map(map_id):
    conn = get_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute("DELETE FROM maps WHERE id = %s", (map_id,))
            if cur.rowcount == 0:
                return jsonify({"error": "not found"}), 404
        return jsonify({"status": "deleted"})
    finally:
        conn.close()


@app.route('/api/maps/<map_id>', methods=['PUT'])
def update_map(map_id):
    data = request.get_json() or {}
    fields = []
    values = []
    if 'name' in data:
        fields.append('name = %s')
        values.append(data['name'])
    if 'map' in data:
        fields.append('data = %s')
        values.append(json.dumps(data['map']))
    if not fields:
        return jsonify({'error': 'no fields to update'}), 400
    values.append(map_id)
    conn = get_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(f"UPDATE maps SET {', '.join(fields)} WHERE id = %s", values)
            if cur.rowcount == 0:
                return jsonify({"error": "not found"}), 404
        return jsonify({"status": "ok"})
    finally:
        conn.close()


if __name__ == '__main__':
    # Bind to a dedicated IP instead of localhost
    app.run(host='192.168.56.102', port=5000, debug=True)
