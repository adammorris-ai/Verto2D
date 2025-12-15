/**
 * Color utilities (RGBA)
 */

export class Color {
  constructor(
    public r = 1,
    public g = 1,
    public b = 1,
    public a = 1
  ) {}

  static white(): Color {
    return new Color(1, 1, 1, 1);
  }

  static black(): Color {
    return new Color(0, 0, 0, 1);
  }

  static red(): Color {
    return new Color(1, 0, 0, 1);
  }

  static green(): Color {
    return new Color(0, 1, 0, 1);
  }

  static blue(): Color {
    return new Color(0, 0, 1, 1);
  }

  static fromHex(hex: string): Color {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return new Color(r, g, b, 1);
  }

  static fromRGB(r: number, g: number, b: number, a = 1): Color {
    return new Color(r / 255, g / 255, b / 255, a);
  }

  clone(): Color {
    return new Color(this.r, this.g, this.b, this.a);
  }

  copy(other: Color): Color {
    this.r = other.r;
    this.g = other.g;
    this.b = other.b;
    this.a = other.a;
    return this;
  }

  lerp(other: Color, t: number): Color {
    this.r += (other.r - this.r) * t;
    this.g += (other.g - this.g) * t;
    this.b += (other.b - this.b) * t;
    this.a += (other.a - this.a) * t;
    return this;
  }

  toHex(): string {
    const r = Math.round(this.r * 255).toString(16).padStart(2, '0');
    const g = Math.round(this.g * 255).toString(16).padStart(2, '0');
    const b = Math.round(this.b * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  toArray(): [number, number, number, number] {
    return [this.r, this.g, this.b, this.a];
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array([
      Math.round(this.r * 255),
      Math.round(this.g * 255),
      Math.round(this.b * 255),
      Math.round(this.a * 255),
    ]);
  }

  equals(other: Color, epsilon = 0.0001): boolean {
    return (
      Math.abs(this.r - other.r) < epsilon &&
      Math.abs(this.g - other.g) < epsilon &&
      Math.abs(this.b - other.b) < epsilon &&
      Math.abs(this.a - other.a) < epsilon
    );
  }

  toString(): string {
    return `Color(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }
}
