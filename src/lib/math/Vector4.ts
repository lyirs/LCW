export class Vector4 {
  public x: number = 0;
  public y: number = 0;
  public z: number = 0;
  public w: number = 0;
  constructor(x: number = 0, y?: number, z?: number, w?: number) {
    if (y === undefined || z === undefined || w === undefined) {
      this.set(x, x, x, x);
    } else {
      this.set(x, y, z, w);
    }
  }

  public set(x: number, y: number, z: number, w: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }

  public set r(r: number) {
    this.x = r;
  }

  public get r(): number {
    return this.x;
  }

  public set g(g: number) {
    this.y = g;
  }

  public get g(): number {
    return this.y;
  }

  public set b(b: number) {
    this.z = b;
  }

  public get b(): number {
    return this.z;
  }

  public set a(a: number) {
    this.w = a;
  }

  public get a(): number {
    return this.w;
  }

  public get xyzw(): number[] {
    return [this.x, this.y, this.z, this.w];
  }

  public equals(v: Vector4): boolean {
    return this.x === v.x && this.y === v.y && this.z === v.z && this.w === v.w;
  }

  public static equals(v1: Vector4, v2: Vector4): boolean {
    return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z && v1.w === v2.w;
  }

  public static transformMatrix4(v: Vector4, m: Matrix4): Vector4 {
    const dst = new Vector4();

    const x = v.x;
    const y = v.y;
    const z = v.z;
    const w = v.w;

    dst.x = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    dst.y = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    dst.z = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    dst.w = m[3] * x + m[7] * y + m[11] * z + m[15] * w;

    return dst;
  }

  public static ceil(v: Vector4): Vector4 {
    const t = new Vector4();
    t.x = Math.ceil(v.x);
    t.y = Math.ceil(v.y);
    t.z = Math.ceil(v.z);
    t.w = Math.ceil(v.w);
    return t;
  }

  public static floor(v: Vector4): Vector4 {
    const t = new Vector4();
    t.x = Math.floor(v.x);
    t.y = Math.floor(v.y);
    t.z = Math.floor(v.z);
    t.w = Math.floor(v.w);
    return t;
  }

  public static round(v: Vector4): Vector4 {
    const t = new Vector4();
    t.x = Math.round(v.x);
    t.y = Math.round(v.y);
    t.z = Math.round(v.z);
    t.w = Math.round(v.w);
    return t;
  }

  public clamp(min: Vector4, max: Vector4) {
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    this.z = Math.max(min.z, Math.min(max.z, this.z));
    this.w = Math.max(min.w, Math.min(max.w, this.w));
    return this;
  }

  public add(v: Vector4): Vector4 {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    this.w += v.w;
    return this;
  }

  public static add(v1: Vector4, v2: Vector4): Vector4 {
    const v = new Vector4();
    v.x = v1.x + v2.x;
    v.y = v1.y + v2.y;
    v.z = v1.z + v2.z;
    v.w = v1.w + v2.w;
    return v;
  }

  public sub(v: Vector4): Vector4 {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    this.w -= v.w;
    return this;
  }

  public static sub(v1: Vector4, v2: Vector4): Vector4 {
    const v = new Vector4();
    v.x = v1.x - v2.x;
    v.y = v1.y - v2.y;
    v.z = v1.z - v2.z;
    v.w = v1.w - v2.w;
    return v;
  }

  public scale(k: number): Vector4 {
    this.x *= k;
    this.y *= k;
    this.z *= k;
    this.w *= k;
    return this;
  }

  public static scale(v1: Vector4, k: number): Vector4 {
    const v = new Vector4();
    v.x = v1.x * k;
    v.y = v1.y * k;
    v.z = v1.z * k;
    v.w = v1.w * k;
    return v;
  }

  public mul(v: Vector4): Vector4 {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    this.w *= v.w;
    return this;
  }

  public static mul(v1: Vector4, v2: Vector4): Vector4 {
    const v = new Vector4();
    v.x = v1.x * v2.x;
    v.y = v1.y * v2.y;
    v.z = v1.z * v2.z;
    v.w = v1.w * v2.w;
    return v;
  }

  public divScalar(k: number): Vector4 {
    this.x /= k;
    this.y /= k;
    this.z /= k;
    this.w /= k;
    return this;
  }

  public static divScalar(v1: Vector4, k: number): Vector4 {
    const v = new Vector4();
    v.x = v1.x / k;
    v.y = v1.y / k;
    v.z = v1.z / k;
    v.w = v1.w / k;
    return v;
  }

  public div(v: Vector4): Vector4 {
    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;
    this.w /= v.w;
    return this;
  }

  public static div(v1: Vector4, v2: Vector4): Vector4 {
    const v = new Vector4();
    v.x = v1.x / v2.x;
    v.y = v1.y / v2.y;
    v.z = v1.z / v2.z;
    v.w = v1.w / v2.w;
    return v;
  }

  public static lerp(v1: Vector4, v2: Vector4, t: number): Vector4 {
    const v = new Vector4();
    v.x = v1.x + t * (v2.x - v1.x);
    v.y = v1.y + t * (v2.y - v1.y);
    v.z = v1.z + t * (v2.z - v1.z);
    v.w = v1.w + t * (v2.w - v1.w);
    return v;
  }

  public min(v: Vector4): Vector4 {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);
    this.w = Math.min(this.w, v.w);
    return this;
  }

  public static min(v1: Vector4, v2: Vector4) {
    const v = new Vector4();
    v.x = Math.min(v1.x, v2.x);
    v.y = Math.min(v1.y, v2.y);
    v.z = Math.min(v1.z, v2.z);
    v.w = Math.min(v1.w, v2.w);
    return v;
  }

  public max(v: Vector4): Vector4 {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);
    this.w = Math.max(this.w, v.w);
    return this;
  }

  public static max(v1: Vector4, v2: Vector4) {
    const v = new Vector4();
    v.x = Math.max(v1.x, v2.x);
    v.y = Math.max(v1.y, v2.y);
    v.z = Math.max(v1.z, v2.z);
    v.w = Math.max(v1.w, v2.w);
    return v;
  }

  public inverse(): Vector4 {
    this.x = 1 / this.x;
    this.y = 1 / this.y;
    this.z = 1 / this.z;
    this.w = 1 / this.w;
    return this;
  }

  public static dot(v1: Vector4, v2: Vector4): number {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z + v1.w * v2.w;
  }

  public get lengthSquraed(): number {
    return (
      this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
    );
  }

  public get length(): number {
    return Math.sqrt(this.lengthSquraed);
  }

  public static distanceSq(v1: Vector4, v2: Vector4): number {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    const dz = v1.z - v2.z;
    const dw = v1.w - v2.w;
    return dx * dx + dy * dy + dz * dz + dw * dw;
  }

  public static distance(v1: Vector4, v2: Vector4): number {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    const dz = v1.z - v2.z;
    const dw = v1.w - v2.w;
    return Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw);
  }

  public normalize(): Vector4 {
    const length = this.length;
    if (length > 0.0001) {
      this.x = this.x / length;
      this.y = this.y / length;
      this.z = this.z / length;
      this.w = this.w / length;
    } else {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 0;
    }
    return this;
  }

  public static normalize(v: Vector4): Vector4 {
    const t = new Vector4();
    const length = v.length;
    if (length > 0.0001) {
      t.x = v.x / length;
      t.y = v.y / length;
      t.z = v.z / length;
      t.w = v.w / length;
    } else {
      t.x = 0;
      t.y = 0;
      t.z = 0;
      t.w = 0;
    }
    return t;
  }

  public zero(): Vector4 {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = 0;
    return this;
  }

  public negate(): Vector4 {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    this.w = -this.w;
    return this;
  }
}
