import { Obstacle } from './obstacle.js';

export function generateBorder(gameMap) {
  const { cols, rows, cellSize, obstacles } = gameMap;
  for (let x = 0; x < cols; x++) {
    for (const y of [0, rows - 1]) {
      obstacles.push(new Obstacle(x * cellSize, y * cellSize, cellSize));
    }
  }
  for (let y = 1; y < rows - 1; y++) {
    for (const x of [0, cols - 1]) {
      obstacles.push(new Obstacle(x * cellSize, y * cellSize, cellSize));
    }
  }
}

export function generateMaze(gameMap) {
  const { cols, rows, cellSize, obstacles } = gameMap;
  obstacles.length = 0;
  const minPassage = 4, maxPassage = 6;
  let y = 1;
  while (y < rows - 1) {
    const h = Math.floor(Math.random() * (maxPassage - minPassage + 1)) + minPassage;
    for (let x = 1; x < cols - 1; x++) if (Math.random() < 0.3)
      obstacles.push(new Obstacle(x * cellSize, y * cellSize, cellSize));
    y += h;
    if (y < rows - 1) {
      const gapStart = Math.floor(Math.random() * (cols - 10)) + 5;
      const gapWidth = Math.floor(Math.random() * 3) + 4;
      for (let x = 1; x < cols - 1; x++) if (x < gapStart || x > gapStart + gapWidth)
        obstacles.push(new Obstacle(x * cellSize, y * cellSize, cellSize));
      y++;
    }
  }
  generateBorder(gameMap);
}
