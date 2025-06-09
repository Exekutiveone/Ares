# ECODE Project

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

The interface now supports selecting an asset to move with the arrow keys, saving/loading maps as JSON and calculating a shortest path to any target. Hovering over assets or tasks shows detailed information. Use the "Calc Path" button to draw the path from the active asset to the nearest target.

### Running the frontend

The prototype lives inside the `frontend` folder. Any static HTTP server can be
used to view it locally. One option bundled with Python is:

```bash
cd frontend
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser. No backend connectivity is
required.
