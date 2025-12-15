/**
 * 2D Vector math
 */

export class Vec2 {
  constructor(public x = 0, public y = 0) {}

  static zero(): Vec2 {
    return new Vec2(0, 0);
  }

  static one(): Vec2 {
    return new Vec2(1, 1);
  }

  static from(x: number, y: number): Vec2 {
    return new Vec2(x, y);
  }

  static fromArray([x, y]: [number, number]): Vec2 {
    return new Vec2(x, y);
  }

  clone(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  copy(other: Vec2): Vec2 {
    this.x = other.x;
    this.y = other.y;
    return this;
  }

  add(other: Vec2): Vec2 {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  addScalar(s: number): Vec2 {
    this.x += s;
    this.y += s;
    return this;
  }

  sub(other: Vec2): Vec2 {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  subScalar(s: number): Vec2 {
    this.x -= s;
    this.y -= s;
    return this;
  }

  mul(other: Vec2): Vec2 {
    this.x *= other.x;
    this.y *= other.y;
    return this;
  }

  mulScalar(s: number): Vec2 {
    this.x *= s;
    this.y *= s;
    return this;
  }

  div(other: Vec2): Vec2 {
    this.x /= other.x;
    this.y /= other.y;
    return this;
  }

  divScalar(s: number): Vec2 {
    this.x /= s;
    this.y /= s;
    return this;
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  lengthSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): Vec2 {
    const len = this.length();
    if (len > 0) {
      this.divScalar(len);
    }
    return this;
  }

  distance(other: Vec2): number {
    return Math.sqrt(
      (this.x - other.x) ** 2 + (this.y - other.y) ** 2
    );
  }

  distanceSq(other: Vec2): number {
    return (this.x - other.x) ** 2 + (this.y - other.y) ** 2;
  }

  dot(other: Vec2): number {
    return this.x * other.x + this.y * other.y;
  }

  lerp(other: Vec2, t: number): Vec2 {
    this.x += (other.x - this.x) * t;
    this.y += (other.y - this.y) * t;
    return this;
  }

  equals(other: Vec2, epsilon = 0.0001): boolean {
    return (
      Math.abs(this.x - other.x) < epsilon &&
      Math.abs(this.y - other.y) < epsilon
    );
  }

  toArray(): [number, number] {
    return [this.x, this.y];
  }

  toString(): string {
    return `Vec2(${this.x}, ${this.y})`;
  }
}
