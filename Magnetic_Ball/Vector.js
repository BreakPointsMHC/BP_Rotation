class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  // Factories

  static rect(x, y) {
    return new Vector(x, y);
  }

  static polar(angle, mag) {
    return new Vector(Math.cos(angle) * mag, Math.sin(angle) * mag);
  }

  static zero() {
    return new Vector(0, 0);
  }

  static clone(v) {
    return new Vector(v.x, v.y);
  }

  // Magnite and angle

  mag() {
    return Math.hypot(this.x, this.y);
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  // Operations

  plus(v) {
    return new Vector(this.x + v.x, this.y + v.y);
  }

  plusCoordinates(vx, vy) {
    return new Vector(this.x + vx, this.y + vy);
  }

  minus(v) {
    return new Vector(this.x - v.x, this.y - v.y);
  }

  minusCoordinates(vx, vy) {
    return new Vector(this.x - vx, this.y - vy);
  }

  times(v) {
    return new Vector(this.x * v.x, this.y * v.y);
  }

  timesCoordinates(vx, vy) {
    return new Vector(this.x * vx, this.y * vy);
  }

  timesScalar(n) {
    return new Vector(this.x * n, this.y * n);
  }

  dividedBy(v) {
    return new Vector(this.x / v.x, this.y / v.y);
  }

  dividedByCoordinates(vx, vy) {
    return new Vector(this.x / vx, this.y / vy);
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  plusAngle(addedAngle) {
    return Vector.polar(this.angle() + addedAngle, this.mag());
  }

  // Mics
  unit() {
    let m = this.mag();
    return m === 0 ? new Vector(0, 0) : new Vector(this.x / m, this.y / m);
  }

}
