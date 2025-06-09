function createAsset() {
  const name = document.getElementById('assetName').value.trim();
  const type = document.getElementById('assetType').value;
  const status = document.getElementById('assetStatus').value;
  const battery = parseInt(document.getElementById('assetBattery').value, 10);

  if (!name || isNaN(battery)) {
    alert("Bitte alle Felder korrekt ausfüllen.");
    return;
  }

  fetch('http://127.0.0.1:5000/api/assets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type, status, battery })
  })
  .then(res => {
    if (!res.ok) throw new Error('Fehler beim Speichern');
    return res.json();
  })
  .then(() => {
    loadAssets();
  })
  .catch(err => alert(err.message));
}

function loadAssets() {
  fetch('http://127.0.0.1:5000/api/assets')
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('assetList');
      list.innerHTML = '';
      data.forEach(asset => {
        const div = document.createElement('div');
        div.className = 'asset-item';
        const info = document.createElement('span');
        info.textContent = `ID: ${asset.id} | Name: ${asset.name} | Typ: ${asset.type} | Status: ${asset.status} | Batterie: ${asset.battery}%`;
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Bearbeiten';
        editBtn.style.marginLeft = '10px';
        editBtn.onclick = () => editAsset(asset);
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Löschen';
        delBtn.style.marginLeft = '5px';
        delBtn.onclick = () => deleteAsset(asset.id);
        div.appendChild(info);
        div.appendChild(editBtn);
        div.appendChild(delBtn);
        list.appendChild(div);
      });
    });
}

window.onload = loadAssets;

function deleteAsset(id) {
  if (!confirm('Asset wirklich löschen?')) return;
  fetch(`http://127.0.0.1:5000/api/assets/${id}`, { method: 'DELETE' })
    .then(res => {
      if (!res.ok) throw new Error('Fehler beim Löschen');
      return res.json();
    })
    .then(() => loadAssets())
    .catch(err => alert(err.message));
}

function editAsset(asset) {
  const name = prompt('Name', asset.name);
  if (name === null) return;
  const type = prompt('Typ (ground/air)', asset.type);
  if (type === null) return;
  const status = prompt('Status', asset.status);
  if (status === null) return;
  const battery = prompt('Batterie', asset.battery);
  if (battery === null) return;
  fetch(`http://127.0.0.1:5000/api/assets/${asset.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type, status, battery: parseFloat(battery) })
  })
    .then(res => {
      if (!res.ok) throw new Error('Fehler beim Aktualisieren');
      return res.json();
    })
    .then(() => loadAssets())
    .catch(err => alert(err.message));
}
