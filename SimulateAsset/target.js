export class Target {
  constructor(x, y, radius = 10) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  draw(ctx) {
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  contains(px, py) {
    return (px - this.x) ** 2 + (py - this.y) ** 2 <= this.radius ** 2;
  }

  intersectsRect(x, y, w, h) {
    return this.x >= x && this.x <= x + w && this.y >= y && this.y <= y + h;
  }
}
