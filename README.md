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
