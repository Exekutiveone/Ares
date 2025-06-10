class Target {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  attach(cellEl) {
    if (!cellEl) return;
    if (!cellEl.querySelector('.target-dot')) {
      const dot = document.createElement('div');
      dot.className = 'target-dot';
      cellEl.appendChild(dot);
    }
  }
}

window.Target = Target;
