// obstacle.js
export class Obstacle {
  constructor(x, y, radius) {
    this.x      = x
    this.y      = y
    this.radius = radius
  }

  draw(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
    ctx.fillStyle = '#888'
    ctx.fill()
  }

  intersectsRect(x, y, w, h) {
    const nearestX = Math.max(x, Math.min(this.x, x + w))
    const nearestY = Math.max(y, Math.min(this.y, y + h))
    const dx = this.x - nearestX
    const dy = this.y - nearestY
    return dx*dx + dy*dy <= this.radius*this.radius
  }
}
