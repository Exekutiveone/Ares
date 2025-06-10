# Project Ares

This repository contains experiments for controlling Raspberry Pi hardware (camera, servos, sensors) and running simple simulations.

## Environment Module (Java)

The `Environment` package now provides several Java classes used to represent a grid based scenario for simulations:

- `Coord` – simple coordinate pair.
- `GridMap` – 2D map that tracks obstacles, assets and targets.
- `Asset` – basic actor with a status and battery value which can move on the map.
- `Task` – description of work that may span multiple coordinates and have a priority.

These classes form a starting point for building a more complete simulation in Java.

## Frontend Prototype

The `frontend` folder contains a small HTML/JS interface that visualizes the `GridMap` structure. The UI lets you mark obstacles, targets and walkable cells, place assets and assign simple tasks. A toggle is provided to switch between the full map and a POV style view around a selected asset.

Open `frontend/index.html` in a browser to try it out. No backend connectivity is required.

## Backend

The `Backend` folder documents how to set up a PostgreSQL server and how the Java client connects to it. See `Backend/config_server.md` for the step-by-step instructions used in the home lab.

## Flask Map API Example

A small Flask application is provided in `Backend/map_api.py` to store maps in PostgreSQL.
Install dependencies with:

```bash
pip install -r Backend/requirements.txt
```

Start the server:

```bash
python Backend/map_api.py
```

It expects a table `maps` with the following schema:

```sql
CREATE TABLE maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);
```

Send a `POST` request to `/api/maps` with JSON
`{"name": "Map A", "map": {...}}` to save a map.

## Flask Asset API

`Backend/asset_api.py` provides CRUD endpoints for managing assets.
Run the server with:

```bash
python Backend/asset_api.py
```

Available routes:

- `POST /api/assets` – create an asset
- `GET /api/assets` – list assets
- `GET /api/assets/<id>` – fetch one asset
- `PUT /api/assets/<id>` – update fields of an asset
- `DELETE /api/assets/<id>` – remove an asset

## Flask Car Data API


`Backend/car_api.py` exposes a very small Flask service that returns car
telemetry values and serves a demo video. Install the requirements and start the
server just like the other Flask examples:

```bash
pip install -r Backend/requirements.txt
python Backend/car_api.py
```

The service listens on port `5001` and provides these endpoints:

- `GET /api/car` – return the current telemetry values
- `POST /api/car` – update the telemetry state with a JSON payload
- `GET /api/video` – stream `dummy-video.mp4` if it is present

Example data sent to `POST /api/car`:

```json
{
  "speed": 12.5,
  "rpm": 1250,
  "gyro": 90.0,
  "distances": {"front": 100, "rear": 110, "left": 95, "right": 120}
}
```

When requesting `GET /api/car` you receive the same structure with the latest
values, e.g.:

```json
{
  "speed": 27.4,
  "rpm": 2740,
  "gyro": 123.4,
  "distances": {"front": 83, "rear": 65, "left": 30, "right": 74}
}
```

The JavaScript simulation posts its calculated data to `/api/car` so that
`Transmitter/car_dashboard.html` can show the live telemetry values. Open this
HTML file in your browser to see the dashboard and use the arrow cross to send
movement commands.


## Car Control API

A separate Flask service is provided in `Transmitter/control_api.py` for sending
movement commands to the vehicle. Start it with:

```bash
python Transmitter/control_api.py
```

It runs on port `5002` and accepts POST requests to `/api/control` with an
`action` field:

```bash
curl -X POST http://localhost:5002/api/control \
     -H "Content-Type: application/json" \
     -d '{"action": "forward"}'
```

Valid actions are `forward`, `backward`, `left`, `right` and `stop` (the values
`up` and `down` are accepted as synonyms for `forward` and `backward`). The
implementation simply records the last action; integration with actual hardware
can be added where indicated in the code.

For the JavaScript simulation the same API is provided in
`Transmitter/control_api.py`. Start it with:

```bash
python Transmitter/control_api.py
```

This service listens on port `5002` as well.

`GET /api/control` returns the last command that was received:

```bash
curl http://localhost:5002/api/control
```

responds with

```json
{"action": "forward"}
```

### Control Unit and Map 2

`Transmitter/control_unit.html` provides a small UI with arrow buttons that send
commands to `/api/control`. The simulation in `SimulateAsset/map2.html` polls
this endpoint periodically (every 200&nbsp;ms) to obtain the last command and
maps it to the arrow keys of the virtual car. When both pages are open you can
steer the vehicle in Map&nbsp;2 with the control unit.

### Autopilot

1. Start the control API if it is not already running:

   ```bash
   python Transmitter/control_api.py
   ```

2. Open `SimulateAsset/map2.html` in a browser.
3. Place obstacles and a target, then click **Optimal Pathfinder**.
4. The script calculates a path and automatically issues movement commands
   through the control API. Manual keyboard input is ignored until the route is
   finished.

### API Ports

- `Backend/map_api.py` – 5000
- `SimulateAsset/car_api.py` – 5001
- `Transmitter/control_api.py` – 5002
