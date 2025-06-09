# backend/asset_api.py
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

@app.route('/api/assets', methods=['POST'])
def save_asset():
    data = request.get_json()
    required = ['name', 'type', 'status', 'battery']
    if not all(k in data for k in required):
        return jsonify({'error': 'invalid payload'}), 400
    conn = get_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                "INSERT INTO assets (id, name, type, status, battery) VALUES (%s, %s, %s, %s, %s)",
                (str(uuid.uuid4()), data['name'], data['type'], data['status'], data['battery'])
            )
        return jsonify({'status': 'ok'})
    finally:
        conn.close()

@app.route('/api/assets', methods=['GET'])
def list_assets():
    conn = get_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute("SELECT id, name, type, status, battery FROM assets")
            rows = cur.fetchall()
            assets = [dict(id=r[0], name=r[1], type=r[2], status=r[3], battery=r[4]) for r in rows]
        return jsonify(assets)
    finally:
        conn.close()

@app.route('/api/assets/<asset_id>', methods=['GET'])
def get_asset(asset_id):
    conn = get_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute("SELECT id, name, type, status, battery FROM assets WHERE id = %s", (asset_id,))
            r = cur.fetchone()
            if r:
                return jsonify(dict(id=r[0], name=r[1], type=r[2], status=r[3], battery=r[4]))
            else:
                return jsonify({"error": "not found"}), 404
    finally:
        conn.close()


@app.route('/api/assets/<asset_id>', methods=['DELETE'])
def delete_asset(asset_id):
    conn = get_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute("DELETE FROM assets WHERE id = %s", (asset_id,))
            if cur.rowcount == 0:
                return jsonify({"error": "not found"}), 404
        return jsonify({"status": "deleted"})
    finally:
        conn.close()


@app.route('/api/assets/<asset_id>', methods=['PUT'])
def update_asset(asset_id):
    data = request.get_json() or {}
    fields = []
    values = []
    if 'name' in data:
        fields.append('name = %s')
        values.append(data['name'])
    if 'type' in data:
        fields.append('type = %s')
        values.append(data['type'])
    if 'status' in data:
        fields.append('status = %s')
        values.append(data['status'])
    if 'battery' in data:
        fields.append('battery = %s')
        values.append(data['battery'])
    if not fields:
        return jsonify({'error': 'no fields to update'}), 400
    values.append(asset_id)
    conn = get_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(f"UPDATE assets SET {', '.join(fields)} WHERE id = %s", values)
            if cur.rowcount == 0:
                return jsonify({"error": "not found"}), 404
        return jsonify({"status": "ok"})
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)
