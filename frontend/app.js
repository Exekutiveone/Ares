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
  selectedAssetId: null
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
  document.getElementById('assetSelect').addEventListener('change', e => {
    state.selectedAssetId = e.target.value;
  });
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
    div.dataset.x = cell.x;
    div.dataset.y = cell.y;
    div.addEventListener('click', onCellClick);
    div.textContent = cell.assetId ? cell.assetId : '';
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
  const startX = asset.x - 2; // ~1.5m to the left
  const endX = asset.x + 2;  // ~1.5m to the right
  const endY = asset.y + 7;
  for (let y = asset.y - 1; y <= endY; y++) {
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
  const mode = document.getElementById('editMode').value;
  if (mode === 'asset') {
    const asset = state.assets.find(a => a.id === state.selectedAssetId);
    if (asset) {
      state.map.placeAsset(asset, x, y);
    }
  } else {
    state.map.setType(x, y, mode);
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

init();
