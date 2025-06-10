import { Obstacle } from './Obstacle.js';

export function generateBorder(gameMap, respawnTarget) {
  const { cols, rows, cellSize, obstacles, target } = gameMap;
  for (let x = 0; x < cols; x++) {
    for (const y of [0, rows - 1]) {
      const ox = x * cellSize;
      const oy = y * cellSize;
      if (target && target.intersectsRect(ox, oy, cellSize, cellSize)) {
        if (typeof respawnTarget === 'function') respawnTarget();
        else continue;
      }
      obstacles.push(new Obstacle(ox, oy, cellSize));
    }
  }
  for (let y = 1; y < rows - 1; y++) {
    for (const x of [0, cols - 1]) {
      const ox = x * cellSize;
      const oy = y * cellSize;
      if (target && target.intersectsRect(ox, oy, cellSize, cellSize)) {
        if (typeof respawnTarget === 'function') respawnTarget();
        else continue;
      }
      obstacles.push(new Obstacle(ox, oy, cellSize));
    }
  }
}

export function generateMaze(gameMap, respawnTarget) {
  const { cols, rows, cellSize, obstacles, target } = gameMap;
  obstacles.length = 0;
  const minPassage = 4, maxPassage = 6;
  let y = 1;
  while (y < rows - 1) {
    const h = Math.floor(Math.random() * (maxPassage - minPassage + 1)) + minPassage;
    // Ensure at least one three-cell wide opening in this row
    const rowGapStart = 3 + Math.floor(Math.random() * (cols - 6));
    const rowGapEnd = rowGapStart + 2;
    for (let x = 3; x < cols - 3;) {
      if (x >= rowGapStart && x <= rowGapEnd) { x++; continue; }
      if (Math.random() < 0.3) {
        const ox = x * cellSize;
        const oy = y * cellSize;
        if (target && target.intersectsRect(ox, oy, cellSize, cellSize)) {
          if (typeof respawnTarget === 'function') respawnTarget();
          else { x++; continue; }
        }
        obstacles.push(new Obstacle(ox, oy, cellSize));
        x += 3; // maintain a walkable gap after each obstacle
      } else {
        x++;
      }
    }
    y += h;
    if (y < rows - 1) {
      const gapStart = Math.floor(Math.random() * (cols - 10)) + 5;
      const gapWidth = Math.floor(Math.random() * 3) + 4;
      for (let x = 1; x < cols - 1; x++) if (x < gapStart || x > gapStart + gapWidth) {
        const ox = x * cellSize;
        const oy = y * cellSize;
        if (target && target.intersectsRect(ox, oy, cellSize, cellSize)) {
          if (typeof respawnTarget === 'function') respawnTarget();
          else continue;
        }
        obstacles.push(new Obstacle(ox, oy, cellSize));
      }
      y++;
    }
  }
  generateBorder(gameMap, respawnTarget);
}
