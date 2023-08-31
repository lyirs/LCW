import { Vector3 } from "./Vector3";

export const Matrix4 = {
  set(
    v0: number,
    v1: number,
    v2: number,
    v3: number,
    v4: number,
    v5: number,
    v6: number,
    v7: number,
    v8: number,
    v9: number,
    v10: number,
    v11: number,
    v12: number,
    v13: number,
    v14: number,
    v15: number
  ): Matrix4 {
    const dst = new Float32Array(16);
    dst[0] = v0;
    dst[1] = v1;
    dst[2] = v2;
    dst[3] = v3;
    dst[4] = v4;
    dst[5] = v5;
    dst[6] = v6;
    dst[7] = v7;
    dst[8] = v8;
    dst[9] = v9;
    dst[10] = v10;
    dst[11] = v11;
    dst[12] = v12;
    dst[13] = v13;
    dst[14] = v14;
    dst[15] = v15;
    return dst;
  },

  identity(): Matrix4 {
    // prettier-ignore
    return this.set(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    )
  },

  copy(m: Matrix4) {
    const dst = new Float32Array(16);
    for (let i = 0; i < 16; i++) {
      dst[i] = m[i];
    }
    return dst;
  },

  perspective(fov: number, aspect: number, near: number, far: number): Matrix4 {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
    const rangeInv = 1.0 / (near - far);
    // prettier-ignore
    return this.set(
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far) * rangeInv, -1,
      0, 0, near * far * rangeInv, 0
    )
    // prettier-ignore
    return this.set(
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    )
  },

  ortho(
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number
  ) {
    // prettier-ignore
    return this.set(
      2 / (right - left),    0,                   0,                  (right + left) / (left - right),
      0,                     2 / (top - bottom),  0,                  (top + bottom) / (bottom - top),
      0,                     0,                   1 / (near - far),   near / (near - far),
      0,                     0,                   0,                  1
    )
  },

  lookAt(eye: Vector3, target: Vector3, up: Vector3): Matrix4 {
    const zAxis = Vector3.normalize(Vector3.sub(eye, target));
    const xAxis = Vector3.normalize(Vector3.cross(up, zAxis));
    const yAxis = Vector3.normalize(Vector3.cross(zAxis, xAxis));
    // prettier-ignore
    return this.set(
      xAxis.x, yAxis.x, zAxis.x, 0,
      xAxis.y, yAxis.y, zAxis.y, 0,
      xAxis.z, yAxis.z, zAxis.z, 0,
      -(xAxis.x * eye.x + xAxis.y * eye.y + xAxis.z * eye.z),
      -(yAxis.x * eye.x + yAxis.y * eye.y + yAxis.z * eye.z),
      -(zAxis.x * eye.x + zAxis.y * eye.y + zAxis.z * eye.z),
      1
    )
  },

  multiply(a: Matrix4, b: Matrix4): Matrix4 {
    const dst = new Float32Array(16);
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a03 = a[3];
    const a10 = a[4 + 0];
    const a11 = a[4 + 1];
    const a12 = a[4 + 2];
    const a13 = a[4 + 3];
    const a20 = a[8 + 0];
    const a21 = a[8 + 1];
    const a22 = a[8 + 2];
    const a23 = a[8 + 3];
    const a30 = a[12 + 0];
    const a31 = a[12 + 1];
    const a32 = a[12 + 2];
    const a33 = a[12 + 3];
    const b00 = b[0];
    const b01 = b[1];
    const b02 = b[2];
    const b03 = b[3];
    const b10 = b[4 + 0];
    const b11 = b[4 + 1];
    const b12 = b[4 + 2];
    const b13 = b[4 + 3];
    const b20 = b[8 + 0];
    const b21 = b[8 + 1];
    const b22 = b[8 + 2];
    const b23 = b[8 + 3];
    const b30 = b[12 + 0];
    const b31 = b[12 + 1];
    const b32 = b[12 + 2];
    const b33 = b[12 + 3];

    dst[0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
    dst[1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
    dst[2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
    dst[3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;
    dst[4] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
    dst[5] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
    dst[6] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
    dst[7] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;
    dst[8] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
    dst[9] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
    dst[10] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
    dst[11] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;
    dst[12] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
    dst[13] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
    dst[14] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
    dst[15] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;

    return dst;
  },

  /**
   * 逆矩阵 基于矩阵的代数余子式（cofactor）和行列式（determinant）。
   * @param m Matrix4
   * @returns m 的逆矩阵.
   */
  invert(m: Matrix4): Matrix4 {
    const dst = new Float32Array(16);

    const m00 = m[0 * 4 + 0];
    const m01 = m[0 * 4 + 1];
    const m02 = m[0 * 4 + 2];
    const m03 = m[0 * 4 + 3];
    const m10 = m[1 * 4 + 0];
    const m11 = m[1 * 4 + 1];
    const m12 = m[1 * 4 + 2];
    const m13 = m[1 * 4 + 3];
    const m20 = m[2 * 4 + 0];
    const m21 = m[2 * 4 + 1];
    const m22 = m[2 * 4 + 2];
    const m23 = m[2 * 4 + 3];
    const m30 = m[3 * 4 + 0];
    const m31 = m[3 * 4 + 1];
    const m32 = m[3 * 4 + 2];
    const m33 = m[3 * 4 + 3];
    const tmp0 = m22 * m33;
    const tmp1 = m32 * m23;
    const tmp2 = m12 * m33;
    const tmp3 = m32 * m13;
    const tmp4 = m12 * m23;
    const tmp5 = m22 * m13;
    const tmp6 = m02 * m33;
    const tmp7 = m32 * m03;
    const tmp8 = m02 * m23;
    const tmp9 = m22 * m03;
    const tmp10 = m02 * m13;
    const tmp11 = m12 * m03;
    const tmp12 = m20 * m31;
    const tmp13 = m30 * m21;
    const tmp14 = m10 * m31;
    const tmp15 = m30 * m11;
    const tmp16 = m10 * m21;
    const tmp17 = m20 * m11;
    const tmp18 = m00 * m31;
    const tmp19 = m30 * m01;
    const tmp20 = m00 * m21;
    const tmp21 = m20 * m01;
    const tmp22 = m00 * m11;
    const tmp23 = m10 * m01;

    const t0 =
      tmp0 * m11 +
      tmp3 * m21 +
      tmp4 * m31 -
      (tmp1 * m11 + tmp2 * m21 + tmp5 * m31);
    const t1 =
      tmp1 * m01 +
      tmp6 * m21 +
      tmp9 * m31 -
      (tmp0 * m01 + tmp7 * m21 + tmp8 * m31);
    const t2 =
      tmp2 * m01 +
      tmp7 * m11 +
      tmp10 * m31 -
      (tmp3 * m01 + tmp6 * m11 + tmp11 * m31);
    const t3 =
      tmp5 * m01 +
      tmp8 * m11 +
      tmp11 * m21 -
      (tmp4 * m01 + tmp9 * m11 + tmp10 * m21);

    const d = 1 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    dst[0] = d * t0;
    dst[1] = d * t1;
    dst[2] = d * t2;
    dst[3] = d * t3;
    dst[4] =
      d *
      (tmp1 * m10 +
        tmp2 * m20 +
        tmp5 * m30 -
        (tmp0 * m10 + tmp3 * m20 + tmp4 * m30));
    dst[5] =
      d *
      (tmp0 * m00 +
        tmp7 * m20 +
        tmp8 * m30 -
        (tmp1 * m00 + tmp6 * m20 + tmp9 * m30));
    dst[6] =
      d *
      (tmp3 * m00 +
        tmp6 * m10 +
        tmp11 * m30 -
        (tmp2 * m00 + tmp7 * m10 + tmp10 * m30));
    dst[7] =
      d *
      (tmp4 * m00 +
        tmp9 * m10 +
        tmp10 * m20 -
        (tmp5 * m00 + tmp8 * m10 + tmp11 * m20));
    dst[8] =
      d *
      (tmp12 * m13 +
        tmp15 * m23 +
        tmp16 * m33 -
        (tmp13 * m13 + tmp14 * m23 + tmp17 * m33));
    dst[9] =
      d *
      (tmp13 * m03 +
        tmp18 * m23 +
        tmp21 * m33 -
        (tmp12 * m03 + tmp19 * m23 + tmp20 * m33));
    dst[10] =
      d *
      (tmp14 * m03 +
        tmp19 * m13 +
        tmp22 * m33 -
        (tmp15 * m03 + tmp18 * m13 + tmp23 * m33));
    dst[11] =
      d *
      (tmp17 * m03 +
        tmp20 * m13 +
        tmp23 * m23 -
        (tmp16 * m03 + tmp21 * m13 + tmp22 * m23));
    dst[12] =
      d *
      (tmp14 * m22 +
        tmp17 * m32 +
        tmp13 * m12 -
        (tmp16 * m32 + tmp12 * m12 + tmp15 * m22));
    dst[13] =
      d *
      (tmp20 * m32 +
        tmp12 * m02 +
        tmp19 * m22 -
        (tmp18 * m22 + tmp21 * m32 + tmp13 * m02));
    dst[14] =
      d *
      (tmp18 * m12 +
        tmp23 * m32 +
        tmp15 * m02 -
        (tmp22 * m32 + tmp14 * m02 + tmp19 * m12));
    dst[15] =
      d *
      (tmp22 * m22 +
        tmp16 * m02 +
        tmp21 * m12 -
        (tmp20 * m12 + tmp23 * m22 + tmp17 * m02));

    return dst;
  },

  transpose(m: Matrix4): Matrix4 {
    const dst = new Float32Array(16);

    const m00 = m[0 * 4 + 0];
    const m01 = m[0 * 4 + 1];
    const m02 = m[0 * 4 + 2];
    const m03 = m[0 * 4 + 3];
    const m10 = m[1 * 4 + 0];
    const m11 = m[1 * 4 + 1];
    const m12 = m[1 * 4 + 2];
    const m13 = m[1 * 4 + 3];
    const m20 = m[2 * 4 + 0];
    const m21 = m[2 * 4 + 1];
    const m22 = m[2 * 4 + 2];
    const m23 = m[2 * 4 + 3];
    const m30 = m[3 * 4 + 0];
    const m31 = m[3 * 4 + 1];
    const m32 = m[3 * 4 + 2];
    const m33 = m[3 * 4 + 3];
  
    dst[ 0] = m00;  dst[ 1] = m10;  dst[ 2] = m20;  dst[ 3] = m30;
    dst[ 4] = m01;  dst[ 5] = m11;  dst[ 6] = m21;  dst[ 7] = m31;
    dst[ 8] = m02;  dst[ 9] = m12;  dst[10] = m22;  dst[11] = m32;
    dst[12] = m03;  dst[13] = m13;  dst[14] = m23;  dst[15] = m33;
  
    return dst;
  }
};
