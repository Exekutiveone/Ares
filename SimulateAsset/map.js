export class GameMap {
  constructor(width, height, margin, cellSize = 40) {
    this.width = width
    this.height = height
    this.margin = margin
    this.cellSize = cellSize
  }

  drawGrid(ctx) {
    ctx.strokeStyle = '#000' // alternativ 'red' für Sichtbarkeit
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
}
