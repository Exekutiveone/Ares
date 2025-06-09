// obstacle.js
export class Obstacle {
  constructor(x, y, size) {
    // x/y are the top left corner of the square
    this.x    = x
    this.y    = y
    this.size = size
  }

  draw(ctx) {
    ctx.fillStyle = '#888'
    ctx.fillRect(this.x, this.y, this.size, this.size)
  }

  intersectsRect(x, y, w, h) {
    // simple AABB collision
    return !(
      x + w < this.x ||
      x > this.x + this.size ||
      y + h < this.y ||
      y > this.y + this.size
    )
  }
}
