/**
 * 3D Vector math
 */

export class Vec3 {
  constructor(public x = 0, public y = 0, public z = 0) {}

  static zero(): Vec3 {
    return new Vec3(0, 0, 0);
  }

  static one(): Vec3 {
    return new Vec3(1, 1, 1);
  }

  static from(x: number, y: number, z: number): Vec3 {
    return new Vec3(x, y, z);
  }

  static fromArray([x, y, z]: [number, number, number]): Vec3 {
    return new Vec3(x, y, z);
  }

  clone(): Vec3 {
    return new Vec3(this.x, this.y, this.z);
  }

  copy(other: Vec3): Vec3 {
    this.x = other.x;
    this.y = other.y;
    this.z = other.z;
    return this;
  }

  add(other: Vec3): Vec3 {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
    return this;
  }

  addScalar(s: number): Vec3 {
    this.x += s;
    this.y += s;
    this.z += s;
    return this;
  }

  sub(other: Vec3): Vec3 {
    this.x -= other.x;
    this.y -= other.y;
    this.z -= other.z;
    return this;
  }

  subScalar(s: number): Vec3 {
    this.x -= s;
    this.y -= s;
    this.z -= s;
    return this;
  }

  mul(other: Vec3): Vec3 {
    this.x *= other.x;
    this.y *= other.y;
    this.z *= other.z;
    return this;
  }

  mulScalar(s: number): Vec3 {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  div(other: Vec3): Vec3 {
    this.x /= other.x;
    this.y /= other.y;
    this.z /= other.z;
    return this;
  }

  divScalar(s: number): Vec3 {
    this.x /= s;
    this.y /= s;
    this.z /= s;
    return this;
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  lengthSq(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  normalize(): Vec3 {
    const len = this.length();
    if (len > 0) {
      this.divScalar(len);
    }
    return this;
  }

  distance(other: Vec3): number {
    return Math.sqrt(
      (this.x - other.x) ** 2 +
      (this.y - other.y) ** 2 +
      (this.z - other.z) ** 2
    );
  }

  distanceSq(other: Vec3): number {
    return (
      (this.x - other.x) ** 2 +
      (this.y - other.y) ** 2 +
      (this.z - other.z) ** 2
    );
  }

  dot(other: Vec3): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  cross(other: Vec3): Vec3 {
    return new Vec3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    );
  }

  lerp(other: Vec3, t: number): Vec3 {
    this.x += (other.x - this.x) * t;
    this.y += (other.y - this.y) * t;
    this.z += (other.z - this.z) * t;
    return this;
  }

  equals(other: Vec3, epsilon = 0.0001): boolean {
    return (
      Math.abs(this.x - other.x) < epsilon &&
      Math.abs(this.y - other.y) < epsilon &&
      Math.abs(this.z - other.z) < epsilon
    );
  }

  toArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }

  toString(): string {
    return `Vec3(${this.x}, ${this.y}, ${this.z})`;
  }
}
