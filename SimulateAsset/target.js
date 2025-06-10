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

  toJSON() {
    return { x: this.x, y: this.y, radius: this.radius };
  }

  static fromJSON(obj) {
    return obj ? new Target(obj.x, obj.y, obj.radius) : null;
  }
}
