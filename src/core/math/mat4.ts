/**
 * 4x4 Matrix math (column-major order for WebGL)
 */

export class Mat4 {
  private m: Float32Array;

  constructor(
    m00 = 1, m01 = 0, m02 = 0, m03 = 0,
    m10 = 0, m11 = 1, m12 = 0, m13 = 0,
    m20 = 0, m21 = 0, m22 = 1, m23 = 0,
    m30 = 0, m31 = 0, m32 = 0, m33 = 1
  ) {
    this.m = new Float32Array(16);
    this.set(
      m00, m01, m02, m03,
      m10, m11, m12, m13,
      m20, m21, m22, m23,
      m30, m31, m32, m33
    );
  }

  static identity(): Mat4 {
    return new Mat4();
  }

  static fromArray(arr: number[] | Float32Array): Mat4 {
    const m = new Mat4();
    m.m.set(arr);
    return m;
  }

  set(
    m00: number, m01: number, m02: number, m03: number,
    m10: number, m11: number, m12: number, m13: number,
    m20: number, m21: number, m22: number, m23: number,
    m30: number, m31: number, m32: number, m33: number
  ): Mat4 {
    this.m[0] = m00; this.m[4] = m01; this.m[8] = m02; this.m[12] = m03;
    this.m[1] = m10; this.m[5] = m11; this.m[9] = m12; this.m[13] = m13;
    this.m[2] = m20; this.m[6] = m21; this.m[10] = m22; this.m[14] = m23;
    this.m[3] = m30; this.m[7] = m31; this.m[11] = m32; this.m[15] = m33;
    return this;
  }

  clone(): Mat4 {
    const m = new Mat4();
    m.m.set(this.m);
    return m;
  }

  copy(other: Mat4): Mat4 {
    this.m.set(other.m);
    return this;
  }

  multiply(other: Mat4): Mat4 {
    const a = this.m;
    const b = other.m;
    const result = new Float32Array(16);

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i * 4 + j] =
          a[i * 4 + 0] * b[0 * 4 + j] +
          a[i * 4 + 1] * b[1 * 4 + j] +
          a[i * 4 + 2] * b[2 * 4 + j] +
          a[i * 4 + 3] * b[3 * 4 + j];
      }
    }

    this.m.set(result);
    return this;
  }

  translate(x: number, y: number, z: number): Mat4 {
    const t = Mat4.identity();
    t.m[12] = x;
    t.m[13] = y;
    t.m[14] = z;
    return this.multiply(t);
  }

  scale(x: number, y: number, z: number): Mat4 {
    const s = Mat4.identity();
    s.m[0] = x;
    s.m[5] = y;
    s.m[10] = z;
    return this.multiply(s);
  }

  rotateX(angle: number): Mat4 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const r = Mat4.identity();
    r.m[5] = c;
    r.m[6] = s;
    r.m[9] = -s;
    r.m[10] = c;
    return this.multiply(r);
  }

  rotateY(angle: number): Mat4 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const r = Mat4.identity();
    r.m[0] = c;
    r.m[2] = -s;
    r.m[8] = s;
    r.m[10] = c;
    return this.multiply(r);
  }

  rotateZ(angle: number): Mat4 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const r = Mat4.identity();
    r.m[0] = c;
    r.m[1] = s;
    r.m[4] = -s;
    r.m[5] = c;
    return this.multiply(r);
  }

  ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4 {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);

    this.set(
      2 * lr, 0, 0, 0,
      0, 2 * bt, 0, 0,
      0, 0, 2 * nf, 0,
      (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1
    );
    return this;
  }

  perspective(fov: number, aspect: number, near: number, far: number): Mat4 {
    const f = 1 / Math.tan(fov / 2);
    const nf = 1 / (near - far);

    this.set(
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0
    );
    return this;
  }

  lookAt(eyeX: number, eyeY: number, eyeZ: number,
         centerX: number, centerY: number, centerZ: number,
         upX: number, upY: number, upZ: number): Mat4 {
    let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
    const eyex = eyeX;
    const eyey = eyeY;
    const eyez = eyeZ;
    const upx = upX;
    const upy = upY;
    const upz = upZ;
    const centerx = centerX;
    const centery = centerY;
    const centerz = centerZ;

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
      x0 = 0;
      x1 = 0;
      x2 = 0;
    } else {
      len = 1 / len;
      x0 *= len;
      x1 *= len;
      x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    this.set(
      x0, y0, z0, 0,
      x1, y1, z1, 0,
      x2, y2, z2, 0,
      -(x0 * eyex + x1 * eyey + x2 * eyez),
      -(y0 * eyex + y1 * eyey + y2 * eyez),
      -(z0 * eyex + z1 * eyey + z2 * eyez),
      1
    );
    return this;
  }

  invert(): Mat4 {
    const a = this.m;
    const b = new Float32Array(16);
    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    b[0] = a11 * a22 * a33 - a11 * a23 * a32 - a21 * a12 * a33 + a21 * a13 * a32 + a31 * a12 * a23 - a31 * a13 * a22;
    b[1] = -a01 * a22 * a33 + a01 * a23 * a32 + a21 * a02 * a33 - a21 * a03 * a32 - a31 * a02 * a23 + a31 * a03 * a22;
    b[2] = a01 * a12 * a33 - a01 * a13 * a32 - a11 * a02 * a33 + a11 * a03 * a32 + a31 * a02 * a13 - a31 * a03 * a12;
    b[3] = -a01 * a12 * a23 + a01 * a13 * a22 + a11 * a02 * a23 - a11 * a03 * a22 - a21 * a02 * a13 + a21 * a03 * a12;
    b[4] = -a10 * a22 * a33 + a10 * a23 * a32 + a20 * a12 * a33 - a20 * a13 * a32 - a30 * a12 * a23 + a30 * a13 * a22;
    b[5] = a00 * a22 * a33 - a00 * a23 * a32 - a20 * a02 * a33 + a20 * a03 * a32 + a30 * a02 * a23 - a30 * a03 * a22;
    b[6] = -a00 * a12 * a33 + a00 * a13 * a32 + a10 * a02 * a33 - a10 * a03 * a32 - a30 * a02 * a13 + a30 * a03 * a12;
    b[7] = a00 * a12 * a23 - a00 * a13 * a22 - a10 * a02 * a23 + a10 * a03 * a22 + a20 * a02 * a13 - a20 * a03 * a12;
    b[8] = a10 * a21 * a33 - a10 * a23 * a31 - a20 * a11 * a33 + a20 * a13 * a31 + a30 * a11 * a23 - a30 * a13 * a21;
    b[9] = -a00 * a21 * a33 + a00 * a23 * a31 + a20 * a01 * a33 - a20 * a03 * a31 - a30 * a01 * a23 + a30 * a03 * a21;
    b[10] = a00 * a11 * a33 - a00 * a13 * a31 - a10 * a01 * a33 + a10 * a03 * a31 + a30 * a01 * a13 - a30 * a03 * a11;
    b[11] = -a00 * a11 * a23 + a00 * a13 * a21 + a10 * a01 * a23 - a10 * a03 * a21 - a20 * a01 * a13 + a20 * a03 * a11;
    b[12] = -a10 * a21 * a32 + a10 * a22 * a31 + a20 * a11 * a32 - a20 * a12 * a31 - a30 * a11 * a22 + a30 * a12 * a21;
    b[13] = a00 * a21 * a32 - a00 * a22 * a31 - a20 * a01 * a32 + a20 * a02 * a31 + a30 * a01 * a22 - a30 * a02 * a21;
    b[14] = -a00 * a11 * a32 + a00 * a12 * a31 + a10 * a01 * a32 - a10 * a02 * a31 - a30 * a01 * a12 + a30 * a02 * a11;
    b[15] = a00 * a11 * a22 - a00 * a12 * a21 - a10 * a01 * a22 + a10 * a02 * a21 + a20 * a01 * a12 - a20 * a02 * a11;

    let det = a00 * b[0] + a01 * b[4] + a02 * b[8] + a03 * b[12];
    if (det === 0) {
      return this;
    }
    det = 1 / det;

    for (let i = 0; i < 16; i++) {
      this.m[i] = b[i] * det;
    }
    return this;
  }

  transpose(): Mat4 {
    const t = this.m[1];
    this.m[1] = this.m[4];
    this.m[4] = t;
    const t2 = this.m[2];
    this.m[2] = this.m[8];
    this.m[8] = t2;
    const t3 = this.m[3];
    this.m[3] = this.m[12];
    this.m[12] = t3;
    const t4 = this.m[6];
    this.m[6] = this.m[9];
    this.m[9] = t4;
    const t5 = this.m[7];
    this.m[7] = this.m[13];
    this.m[13] = t5;
    const t6 = this.m[11];
    this.m[11] = this.m[14];
    this.m[14] = t6;
    return this;
  }

  toArray(): Float32Array {
    return new Float32Array(this.m);
  }

  equals(other: Mat4, epsilon = 0.0001): boolean {
    for (let i = 0; i < 16; i++) {
      if (Math.abs(this.m[i] - other.m[i]) >= epsilon) {
        return false;
      }
    }
    return true;
  }
}
