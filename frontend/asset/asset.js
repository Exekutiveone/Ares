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
        div.textContent = `ID: ${asset.id} | Name: ${asset.name} | Typ: ${asset.type} | Status: ${asset.status} | Batterie: ${asset.battery}%`;
        list.appendChild(div);
      });
    });
}

window.onload = loadAssets;
