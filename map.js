// map.js
export class GameMap {
  constructor(width, height, margin) {
    this.width = width
    this.height = height
    this.margin = margin
  }

  isWithinBounds(x, y, objWidth = 0, objHeight = 0) {
    return (
      x >= this.margin &&
      y >= this.margin &&
      x + objWidth <= this.width - this.margin &&
      y + objHeight <= this.height - this.margin
    )
  }

  drawBorder(ctx) {
    const m = this.margin
    ctx.fillStyle = '#aaa'
    ctx.fillRect(0, 0, this.width, m)
    ctx.fillRect(0, this.height - m, this.width, m)
    ctx.fillRect(0, 0, m, this.height)
    ctx.fillRect(this.width - m, 0, m, this.height)
  }
}
