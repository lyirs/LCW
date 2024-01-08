import { Quaternion } from "./Quaternion";
import { Vector2 } from "./Vector2";

export const Matrix3 = {
  set(
    v0: number,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    v5: number,
    v6: number,
    v7: number,
    v8: number
  ): Matrix4 {
    const dst = new Float32Array(12);
    dst[0] = v0;
    dst[1] = v1;
    dst[2] = v2;
    dst[3] = 0;
    dst[4] = v3;
    dst[5] = v4;
    dst[6] = v5;
    dst[7] = 0;
    dst[8] = v6;
    dst[9] = v7;
    dst[10] = v8;
    dst[11] = 0;
    return dst;
  },

  identity(): Matrix3 {
    // prettier-ignore
    return this.set(
        1, 0, 0,
        0, 1, 0,
        0, 0, 1,
    )
  },

  fromMatrix4(m: Matrix4): Matrix3 {
    const dst = new Float32Array(12);
    dst[0] = m[0];
    dst[1] = m[1];
    dst[2] = m[2];
    dst[3] = 0;
    dst[4] = m[4];
    dst[5] = m[5];
    dst[6] = m[6];
    dst[7] = 0;
    dst[8] = m[8];
    dst[9] = m[9];
    dst[10] = m[10];
    dst[11] = 0;
    return dst;
  },

  fromQuaternion(q: Quaternion): Matrix3 {
    const x = q.x;
    const y = q.y;
    const z = q.z;
    const w = q.w;

    const x2 = x + x;
    const y2 = y + y;
    const z2 = z + z;

    const xx = x * x2;
    const yx = y * x2;
    const yy = y * y2;
    const zx = z * x2;
    const zy = z * y2;
    const zz = z * z2;
    const wx = w * x2;
    const wy = w * y2;
    const wz = w * z2;

    const dst = new Float32Array(12);

    // prettier-ignore
    {
        dst[ 0] = 1 - yy - zz;  dst[ 1] = yx + wz;      dst[ 2] = zx - wy;      dst[ 3] = 0;
        dst[ 4] = yx - wz;      dst[ 5] = 1 - xx - zz;  dst[ 6] = zy + wx;      dst[ 7] = 0;
        dst[ 8] = zx + wy;      dst[ 9] = zy - wx;      dst[10] = 1 - xx - yy;  dst[11] = 0;
    }

    return dst;
  },

  negate(m: Matrix3): Matrix3 {
    const dst = new Float32Array(12);
    // prettier-ignore
    {
        dst[ 0] = -m[ 0];  dst[ 1] = -m[ 1];  dst[ 2] = -m[ 2];
        dst[ 4] = -m[ 4];  dst[ 5] = -m[ 5];  dst[ 6] = -m[ 6];
        dst[ 8] = -m[ 8];  dst[ 9] = -m[ 9];  dst[10] = -m[10];
    }
    return dst;
  },

  copy(m: Matrix3) {
    const dst = new Float32Array(12);
    for (let i = 0; i < 12; i++) {
      dst[i] = m[i];
    }
    return dst;
  },

  equals(a: Matrix3, b: Matrix3): boolean {
    return (
      a[0] === b[0] &&
      a[1] === b[1] &&
      a[2] === b[2] &&
      a[4] === b[4] &&
      a[5] === b[5] &&
      a[6] === b[6] &&
      a[8] === b[8] &&
      a[9] === b[9] &&
      a[10] === b[10]
    );
  },

  transpose(m: Matrix3): Matrix3 {
    const dst = new Float32Array(12);

    const m00 = m[0 * 4 + 0];
    const m01 = m[0 * 4 + 1];
    const m02 = m[0 * 4 + 2];
    const m10 = m[1 * 4 + 0];
    const m11 = m[1 * 4 + 1];
    const m12 = m[1 * 4 + 2];
    const m20 = m[2 * 4 + 0];
    const m21 = m[2 * 4 + 1];
    const m22 = m[2 * 4 + 2];

    dst[0] = m00;
    dst[1] = m10;
    dst[2] = m20;
    dst[4] = m01;
    dst[5] = m11;
    dst[6] = m21;
    dst[8] = m02;
    dst[9] = m12;
    dst[10] = m22;

    return dst;
  },

  invert(m: Matrix3): Matrix3 {
    const dst = new Float32Array(12);
    const m00 = m[0 * 4 + 0];
    const m01 = m[0 * 4 + 1];
    const m02 = m[0 * 4 + 2];
    const m10 = m[1 * 4 + 0];
    const m11 = m[1 * 4 + 1];
    const m12 = m[1 * 4 + 2];
    const m20 = m[2 * 4 + 0];
    const m21 = m[2 * 4 + 1];
    const m22 = m[2 * 4 + 2];

    const t01 = m22 * m11 - m12 * m21;
    const t11 = -m22 * m10 + m12 * m20;
    const t21 = m21 * m10 - m11 * m20;

    const d = 1 / (m00 * t01 + m01 * t11 + m02 * t21);

    dst[0] = t01 * d;
    dst[1] = (-m22 * m01 + m02 * m21) * d;
    dst[2] = (m12 * m01 - m02 * m11) * d;
    dst[4] = t11 * d;
    dst[5] = (m22 * m00 - m02 * m20) * d;
    dst[6] = (-m12 * m00 + m02 * m10) * d;
    dst[8] = t21 * d;
    dst[9] = (-m21 * m00 + m01 * m20) * d;
    dst[10] = (m11 * m00 - m01 * m10) * d;

    return dst;
  },

  determinant(m: Matrix3): number {
    const m00 = m[0 * 4 + 0];
    const m01 = m[0 * 4 + 1];
    const m02 = m[0 * 4 + 2];
    const m10 = m[1 * 4 + 0];
    const m11 = m[1 * 4 + 1];
    const m12 = m[1 * 4 + 2];
    const m20 = m[2 * 4 + 0];
    const m21 = m[2 * 4 + 1];
    const m22 = m[2 * 4 + 2];

    return (
      m00 * (m11 * m22 - m21 * m12) -
      m10 * (m01 * m22 - m21 * m02) +
      m20 * (m01 * m12 - m11 * m02)
    );
  },

  multiply(a: Matrix3, b: Matrix3): Matrix3 {
    const dst = new Float32Array(12);
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a10 = a[4 + 0];
    const a11 = a[4 + 1];
    const a12 = a[4 + 2];
    const a20 = a[8 + 0];
    const a21 = a[8 + 1];
    const a22 = a[8 + 2];
    const b00 = b[0];
    const b01 = b[1];
    const b02 = b[2];
    const b10 = b[4 + 0];
    const b11 = b[4 + 1];
    const b12 = b[4 + 2];
    const b20 = b[8 + 0];
    const b21 = b[8 + 1];
    const b22 = b[8 + 2];

    dst[0] = a00 * b00 + a10 * b01 + a20 * b02;
    dst[1] = a01 * b00 + a11 * b01 + a21 * b02;
    dst[2] = a02 * b00 + a12 * b01 + a22 * b02;
    dst[4] = a00 * b10 + a10 * b11 + a20 * b12;
    dst[5] = a01 * b10 + a11 * b11 + a21 * b12;
    dst[6] = a02 * b10 + a12 * b11 + a22 * b12;
    dst[8] = a00 * b20 + a10 * b21 + a20 * b22;
    dst[9] = a01 * b20 + a11 * b21 + a21 * b22;
    dst[10] = a02 * b20 + a12 * b21 + a22 * b22;

    return dst;
  },

  setTranslation(m: Matrix3, v: Vector2): Matrix3 {
    const dst = new Float32Array(12);
    if (m !== dst) {
      dst[0] = m[0];
      dst[1] = m[1];
      dst[2] = m[2];
      dst[4] = m[4];
      dst[5] = m[5];
      dst[6] = m[6];
    }
    dst[8] = v.x;
    dst[9] = v.y;
    dst[10] = 1;
    return dst;
  },

  getTranslation(m: Matrix3): Vector2 {
    const v = new Vector2();
    v.x = m[8];
    v.y = m[9];
    return v;
  },

  translation(v: Vector2): Matrix3 {
    const dst = new Float32Array(12);
    dst[0] = 1;
    dst[1] = 0;
    dst[2] = 0;
    dst[4] = 0;
    dst[5] = 1;
    dst[6] = 0;
    dst[8] = v.x;
    dst[9] = v.y;
    dst[10] = 1;
    return dst;
  },

  translate(m: Matrix3, v: Vector2): Matrix3 {
    const dst = new Float32Array(12);
    const v0 = v.x;
    const v1 = v.y;

    const m00 = m[0];
    const m01 = m[1];
    const m02 = m[2];
    const m10 = m[1 * 4 + 0];
    const m11 = m[1 * 4 + 1];
    const m12 = m[1 * 4 + 2];
    const m20 = m[2 * 4 + 0];
    const m21 = m[2 * 4 + 1];
    const m22 = m[2 * 4 + 2];

    if (m !== dst) {
      dst[0] = m00;
      dst[1] = m01;
      dst[2] = m02;
      dst[4] = m10;
      dst[5] = m11;
      dst[6] = m12;
    }

    dst[8] = m00 * v0 + m10 * v1 + m20;
    dst[9] = m01 * v0 + m11 * v1 + m21;
    dst[10] = m02 * v0 + m12 * v1 + m22;

    return dst;
  },

  rotation(angleInRadians: number): Matrix3 {
    const dst = new Float32Array(12);
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
    // prettier-ignore
    {
        dst[ 0] =  c;  dst[ 1] = s;  dst[ 2] = 0;
        dst[ 4] = -s;  dst[ 5] = c;  dst[ 6] = 0;
        dst[ 8] =  0;  dst[ 9] = 0;  dst[10] = 1;
    }
    return dst;
  },

  rotate(m: Matrix3, angleInRadians: number): Matrix3 {
    const dst = new Float32Array(12);
    const m00 = m[0 * 4 + 0];
    const m01 = m[0 * 4 + 1];
    const m02 = m[0 * 4 + 2];
    const m10 = m[1 * 4 + 0];
    const m11 = m[1 * 4 + 1];
    const m12 = m[1 * 4 + 2];
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);

    dst[0] = c * m00 + s * m10;
    dst[1] = c * m01 + s * m11;
    dst[2] = c * m02 + s * m12;

    dst[4] = c * m10 - s * m00;
    dst[5] = c * m11 - s * m01;
    dst[6] = c * m12 - s * m02;

    if (m !== dst) {
      dst[8] = m[8];
      dst[9] = m[9];
      dst[10] = m[10];
    }

    return dst;
  },

  scale(m: Matrix3, v: Vector2): Matrix3 {
    const dst = new Float32Array(12);
    const v0 = v.x;
    const v1 = v.y;

    dst[0] = v0 * m[0 * 4 + 0];
    dst[1] = v0 * m[0 * 4 + 1];
    dst[2] = v0 * m[0 * 4 + 2];

    dst[4] = v1 * m[1 * 4 + 0];
    dst[5] = v1 * m[1 * 4 + 1];
    dst[6] = v1 * m[1 * 4 + 2];

    if (m !== dst) {
      dst[8] = m[8];
      dst[9] = m[9];
      dst[10] = m[10];
    }

    return dst;
  },
};
