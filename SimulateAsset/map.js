import { Obstacle } from './obstacle.js'
import { Target } from './target.js'

export class GameMap {
  constructor(cols, rows, cellSize = 40, margin = 0) {
    this.cols = cols
    this.rows = rows
    this.cellSize = cellSize
    this.margin = margin
    this.obstacles = []
    this.task = null
  }

  get width() { return this.cols * this.cellSize }
  get height() { return this.rows * this.cellSize }

  isWithinBounds(x, y, objWidth = 0, objHeight = 0) {
    return (
      x >= this.margin &&
      y >= this.margin &&
      x + objWidth <= this.width - this.margin &&
      y + objHeight <= this.height - this.margin
    )
  }

  drawGrid(ctx) {
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1
    for (let x = 0; x <= this.width; x += this.cellSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, this.height)
      ctx.stroke()
    }
    for (let y = 0; y <= this.height; y += this.cellSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(this.width, y)
      ctx.stroke()
    }
  }

  drawBorder(ctx) {
    ctx.fillStyle = '#aaa'
    ctx.fillRect(0, 0, this.width, this.margin)
    ctx.fillRect(0, this.height - this.margin, this.width, this.margin)
    ctx.fillRect(0, 0, this.margin, this.height)
    ctx.fillRect(this.width - this.margin, 0, this.margin, this.height)
  }

  toJSON() {
    return {
      cols: this.cols,
      rows: this.rows,
      cellSize: this.cellSize,
      margin: this.margin,
      obstacles: this.obstacles.map(o => ({ x: o.x, y: o.y, size: o.size })),
      task: this.task
        ? { x: this.task.x, y: this.task.y, radius: this.task.radius }
        : null
    }
  }

  static fromJSON(obj) {
    const gm = new GameMap(obj.cols, obj.rows, obj.cellSize, obj.margin)
    if (obj.obstacles) {
      gm.obstacles = obj.obstacles.map(o => new Obstacle(o.x, o.y, o.size))
    }
    if (obj.task) {
      gm.task = new Target(obj.task.x, obj.task.y, obj.task.radius)
    } else {
      gm.task = null
    }
    return gm
  }
}
