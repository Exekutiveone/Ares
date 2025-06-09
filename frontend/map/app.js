const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;

class GridMap {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.cells = [];
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        row.push({ type: 'walkable', assetId: null });
      }
      this.cells.push(row);
    }
  }

  inBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  setType(x, y, type) {
    if (this.inBounds(x, y)) {
      this.cells[y][x].type = type;
    }
  }

  placeAsset(asset, x, y) {
    if (this.inBounds(x, y)) {
      if (this.inBounds(asset.x, asset.y) &&
          this.cells[asset.y][asset.x].assetId === asset.id) {
        this.cells[asset.y][asset.x].assetId = null;
      }
      this.cells[y][x].assetId = asset.id;
      asset.x = x;
      asset.y = y;
    }
  }
}

class Asset {
  constructor(id) {
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.taskId = null;
    this.battery = 100;
  }
}

class Task {
  constructor(id, description) {
    this.id = id;
    this.description = description;
    this.assignedAssetId = null;
  }
}

const state = {
  map: new GridMap(GRID_WIDTH, GRID_HEIGHT),
  assets: [],
  tasks: [],
  povMode: false,
  selectedAssetId: null,
  activeAssetId: null,
  path: []
};

function init() {
  for (let i = 1; i <= 2; i++) {
    const a = new Asset('A' + i);
    state.assets.push(a);
  }
  for (let i = 1; i <= 3; i++) {
    const t = new Task('T' + i, 'Task ' + i);
    state.tasks.push(t);
  }
  updateAssetList();
  updateTaskList();
  setGridSize(state.map.width, state.map.height);
  renderGrid();
  document.getElementById('editMode').addEventListener('change', onModeChange);
  document.getElementById('toggleView').addEventListener('click', toggleView);
  document.getElementById('calcPath').addEventListener('click', calculatePath);
  document.getElementById('saveMap').addEventListener('click', saveMap);
  document.getElementById('saveMapDb').addEventListener('click', uploadMap);
  document.getElementById('loadMapBtn').addEventListener('click', () => document.getElementById('loadMap').click());
  document.getElementById('loadMap').addEventListener('change', loadMap);
  document.getElementById('loadMapDb').addEventListener('click', loadMapFromDb);
  document.getElementById('fetchMaps').addEventListener('click', fetchAvailableMaps);
  document.getElementById('renameMapBtn').addEventListener('click', renameMap);
  document.getElementById('deleteMapBtn').addEventListener('click', deleteMap);
  document.getElementById('assetSelect').addEventListener('change', e => {
    state.selectedAssetId = e.target.value;
  });
  window.addEventListener('keydown', onKeyDown);
}

function onModeChange() {
  const mode = document.getElementById('editMode').value;
  document.getElementById('assetSelectWrapper').style.display =
    mode === 'asset' ? 'inline-block' : 'none';
}

function renderGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  const view = state.povMode ? getPOVCells() : getAllCells();
  for (const cell of view) {
    const div = document.createElement('div');
    div.className = 'cell ' + cell.type;
    if (cell.assetId) div.classList.add('asset');
    if (state.path.some(p => p.x === cell.x && p.y === cell.y)) {
      div.classList.add('path');
    }
    if (cell.assetId && cell.assetId === state.activeAssetId) {
      div.classList.add('selected');
    }
    div.dataset.x = cell.x;
    div.dataset.y = cell.y;
    div.addEventListener('click', onCellClick);
    if (cell.assetId) {
      const asset = state.assets.find(a => a.id === cell.assetId);
      div.textContent = cell.assetId;
      div.title = `${asset.id}\nBattery: ${asset.battery}%` +
        (asset.taskId ? `\nTask: ${asset.taskId}` : '');
    }
    grid.appendChild(div);
  }
}

function setGridSize(width, height) {
  const root = document.documentElement;
  root.style.setProperty('--grid-width', width);
  root.style.setProperty('--grid-height', height);
}

function getAllCells() {
  const cells = [];
  for (let y = 0; y < state.map.height; y++) {
    for (let x = 0; x < state.map.width; x++) {
      cells.push({
        x,
        y,
        type: state.map.cells[y][x].type,
        assetId: state.map.cells[y][x].assetId
      });
    }
  }
  return cells;
}

function getPOVCells() {
  const asset = state.assets.find(a => a.id === state.selectedAssetId) || state.assets[0];
  const cells = [];
  const povWidth = 34;
  const povHeight = 88;
  const startX = asset.x - Math.floor(povWidth / 2);
  const endX = startX + povWidth - 1;
  const startY = asset.y - Math.floor(povHeight / 2);
  const endY = startY + povHeight - 1;
  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      if (state.map.inBounds(x, y)) {
        const c = state.map.cells[y][x];
        cells.push({ x, y, type: c.type, assetId: c.assetId });
      }
    }
  }
  return cells;
}

function onCellClick(e) {
  const x = parseInt(e.target.dataset.x, 10);
  const y = parseInt(e.target.dataset.y, 10);
  const cell = state.map.cells[y][x];
  if (cell.assetId) {
    state.activeAssetId = cell.assetId;
    state.path = [];
  } else {
    const mode = document.getElementById('editMode').value;
    if (mode === 'asset') {
      const asset = state.assets.find(a => a.id === state.selectedAssetId);
      if (asset) {
        state.map.placeAsset(asset, x, y);
      }
    } else {
      state.map.setType(x, y, mode);
    }
  }
  renderGrid();
  updateAssetList();
}

function updateAssetList() {
  const list = document.getElementById('assetList');
  const select = document.getElementById('assetSelect');
  list.innerHTML = '';
  select.innerHTML = '';
  state.assets.forEach(a => {
    const li = document.createElement('li');
    li.textContent = a.id + ' (' + a.x + ',' + a.y + ')';
    li.title = `Battery: ${a.battery}%` + (a.taskId ? `\nTask: ${a.taskId}` : '');
    list.appendChild(li);
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = a.id;
    select.appendChild(opt);
  });
  state.selectedAssetId = state.assets[0] ? state.assets[0].id : null;
}

function updateTaskList() {
  const list = document.getElementById('taskList');
  list.innerHTML = '';
  state.tasks.forEach(t => {
    const li = document.createElement('li');
    li.title = 'Assigned: ' + (t.assignedAssetId || 'None');
    const select = document.createElement('select');
    select.innerHTML = '<option value="">--Assign--</option>' +
      state.assets.map(a => `<option value="${a.id}">${a.id}</option>`).join('');
    select.value = t.assignedAssetId || '';
    select.addEventListener('change', () => {
      t.assignedAssetId = select.value;
    });
    li.textContent = t.id + ': ' + t.description + ' ';
    li.appendChild(select);
    list.appendChild(li);
  });
}

function toggleView() {
  state.povMode = !state.povMode;
  document.getElementById('toggleView').textContent = state.povMode ? 'Full Map' : 'POV Mode';
  renderGrid();
}

function onKeyDown(e) {
  if (!state.activeAssetId) return;
  const asset = state.assets.find(a => a.id === state.activeAssetId);
  if (!asset) return;
  let nx = asset.x;
  let ny = asset.y;
  if (e.key === 'ArrowUp') ny -= 1;
  else if (e.key === 'ArrowDown') ny += 1;
  else if (e.key === 'ArrowLeft') nx -= 1;
  else if (e.key === 'ArrowRight') nx += 1;
  if (state.map.inBounds(nx, ny) && state.map.cells[ny][nx].type !== 'obstacle') {
    state.map.placeAsset(asset, nx, ny);
    state.path = [];
    renderGrid();
    updateAssetList();
  }
}

function calculatePath() {
  const asset = state.assets.find(a => a.id === (state.activeAssetId || state.selectedAssetId));
  if (!asset) return;
  const targets = [];
  for (let y = 0; y < state.map.height; y++) {
    for (let x = 0; x < state.map.width; x++) {
      if (state.map.cells[y][x].type === 'target') targets.push({x, y});
    }
  }
  if (targets.length === 0) return;
  const path = bfs(asset, targets);
  state.path = path || [];
  renderGrid();
}

function bfs(asset, targets) {
  const visited = Array.from({length: state.map.height}, () => Array(state.map.width).fill(false));
  const queue = [{x: asset.x, y: asset.y, path: []}];
  visited[asset.y][asset.x] = true;
  const dirs = [[1,0], [-1,0], [0,1], [0,-1]];
  while (queue.length) {
    const cur = queue.shift();
    if (targets.some(t => t.x === cur.x && t.y === cur.y)) {
      return cur.path.concat({x: cur.x, y: cur.y});
    }
    for (const [dx, dy] of dirs) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      if (state.map.inBounds(nx, ny) && !visited[ny][nx] && state.map.cells[ny][nx].type !== 'obstacle') {
        visited[ny][nx] = true;
        queue.push({x: nx, y: ny, path: cur.path.concat({x: cur.x, y: cur.y})});
      }
    }
  }
  return null;
}

function getCurrentMapData() {
  return {
    width: state.map.width,
    height: state.map.height,
    cells: state.map.cells,
    assets: state.assets.map(a => ({id: a.id, x: a.x, y: a.y, battery: a.battery, taskId: a.taskId})),
    tasks: state.tasks.map(t => ({id: t.id, description: t.description, assignedAssetId: t.assignedAssetId}))
  };
}

function saveMap() {
  const data = getCurrentMapData();
  const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'map.json';
  link.click();
}

function getDefaultMapName() {
  const d = new Date();
  return d.toISOString().replace(/[:.]/g, '-');
}

function uploadMap() {
  let name = document.getElementById('mapName').value.trim();
  if (!name) {
    name = getDefaultMapName();
    document.getElementById('mapName').value = name;
  }
  const data = getCurrentMapData();
  fetch('http://127.0.0.1:5000/api/maps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name, map: data })
  }).then(res => {
    if (res.ok) alert('Gespeichert');
    else res.text().then(t => alert('Fehler beim Speichern:\n' + t));
  }).catch(err => {
    alert('Netzwerkfehler:\n' + err);
  });
}

function loadMap(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const obj = JSON.parse(reader.result);
    state.map = new GridMap(obj.width, obj.height);
    state.map.cells = obj.cells;
    state.assets = obj.assets.map(a => Object.assign(new Asset(a.id), a));
    state.tasks = obj.tasks.map(t => Object.assign(new Task(t.id, t.description), {assignedAssetId: t.assignedAssetId}));
    setGridSize(state.map.width, state.map.height);
    state.activeAssetId = null;
    state.path = [];
    updateAssetList();
    updateTaskList();
    renderGrid();
  };
  reader.readAsText(file);
}

function fetchAvailableMaps() {
  fetch('http://127.0.0.1:5000/api/maps')
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById('mapSelect');
      select.innerHTML = '';
      data.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name + ' (' + m.created_at + ')';
        select.appendChild(opt);
      });
    });
}

function loadMapFromDb() {
  const mapId = document.getElementById('mapSelect').value;
  if (!mapId) {
    alert('Keine Map ausgewählt');
    return;
  }
  fetch(`http://127.0.0.1:5000/api/maps/${mapId}`)
    .then(res => res.json())
    .then(obj => {
      state.map = new GridMap(obj.width, obj.height);
      state.map.cells = obj.cells;
      state.assets = obj.assets.map(a => Object.assign(new Asset(a.id), a));
      state.tasks = obj.tasks.map(t => Object.assign(new Task(t.id, t.description), {assignedAssetId: t.assignedAssetId}));
      setGridSize(state.map.width, state.map.height);
      state.activeAssetId = null;
      state.path = [];
      updateAssetList();
      updateTaskList();
      renderGrid();
    });
}

function renameMap() {
  const mapId = document.getElementById('mapSelect').value;
  const newName = document.getElementById('renameMapName').value.trim();
  if (!mapId) {
    alert('Keine Map ausgewählt');
    return;
  }
  if (!newName) {
    alert('Neuer Name fehlt');
    return;
  }
  fetch(`http://127.0.0.1:5000/api/maps/${mapId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName })
  }).then(res => {
    if (res.ok) {
      fetchAvailableMaps();
      alert('Umbenannt');
    } else {
      res.text().then(t => alert('Fehler beim Umbenennen:\n' + t));
    }
  });
}

function deleteMap() {
  const mapId = document.getElementById('mapSelect').value;
  if (!mapId) {
    alert('Keine Map ausgewählt');
    return;
  }
  if (!confirm('Map löschen?')) return;
  fetch(`http://127.0.0.1:5000/api/maps/${mapId}`, {
    method: 'DELETE'
  }).then(res => {
    if (res.ok) {
      fetchAvailableMaps();
      alert('Gelöscht');
    } else {
      res.text().then(t => alert('Fehler beim Löschen:\n' + t));
    }
  });
}

window.onload = () => {
  init();
  fetchAvailableMaps(); // ruft /api/maps auf
};


init();
