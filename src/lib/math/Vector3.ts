export class Vector3 {
  public x: number = 0;
  public y: number = 0;
  public z: number = 0;
  constructor(x: number = 0, y?: number, z?: number) {
    if (y === undefined || z === undefined) {
      this.set(x, x, x);
    } else {
      this.set(x, y, z);
    }
  }

  public set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
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

  public copy(v: Vector3): Vector3 {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  public get lengthSquraed(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  public get length(): number {
    return Math.sqrt(this.lengthSquraed);
  }

  public get manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }

  public static distanceSq(v1: Vector3, v2: Vector3): number {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    const dz = v1.z - v2.z;
    return dx * dx + dy * dy + dz * dz;
  }

  public static distance(v1: Vector3, v2: Vector3): number {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    const dz = v1.z - v2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  public static manhattanDistance(v1: Vector3, v2: Vector3): number {
    return (
      Math.abs(v1.x - v2.x) + Math.abs(v1.y - v2.y) + Math.abs(v1.z - v2.z)
    );
  }

  public equals(v: Vector3): boolean {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }

  public static equals(v1: Vector3, v2: Vector3): boolean {
    return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;
  }

  public static floor(v: Vector3): Vector3 {
    const t = new Vector3();
    t.x = Math.floor(v.x);
    t.y = Math.floor(v.y);
    t.z = Math.floor(v.z);
    return t;
  }

  public static ceil(v: Vector3): Vector3 {
    const t = new Vector3();
    t.x = Math.ceil(v.x);
    t.y = Math.ceil(v.y);
    t.z = Math.ceil(v.z);
    return t;
  }

  public static round(v: Vector3): Vector3 {
    const t = new Vector3();
    t.x = Math.round(v.x);
    t.y = Math.round(v.y);
    t.z = Math.round(v.z);
    return t;
  }

  public add(v: Vector3): Vector3 {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  public static add(v1: Vector3, v2: Vector3): Vector3 {
    const v = new Vector3();
    v.x = v1.x + v2.x;
    v.y = v1.y + v2.y;
    v.z = v1.z + v2.z;
    return v;
  }

  public sub(v: Vector3): Vector3 {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  public static sub(v1: Vector3, v2: Vector3): Vector3 {
    const v = new Vector3();
    v.x = v1.x - v2.x;
    v.y = v1.y - v2.y;
    v.z = v1.z - v2.z;
    return v;
  }

  public scale(k: number): Vector3 {
    this.x *= k;
    this.y *= k;
    this.z *= k;
    return this;
  }

  public static scale(v1: Vector3, k: number): Vector3 {
    const v = new Vector3();
    v.x = v1.x * k;
    v.y = v1.y * k;
    v.z = v1.z * k;
    return v;
  }

  public mul(v: Vector3): Vector3 {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    return this;
  }

  public static mul(v1: Vector3, v2: Vector3): Vector3 {
    const v = new Vector3();
    v.x = v1.x * v2.x;
    v.y = v1.y * v2.y;
    v.z = v1.z * v2.z;
    return v;
  }

  public divScalar(k: number): Vector3 {
    this.x /= k;
    this.y /= k;
    this.z /= k;
    return this;
  }

  public static divScalar(v1: Vector3, k: number): Vector3 {
    const v = new Vector3();
    v.x = v1.x / k;
    v.y = v1.y / k;
    v.z = v1.z / k;
    return v;
  }

  public div(v: Vector3): Vector3 {
    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;
    return this;
  }

  public static div(v1: Vector3, v2: Vector3): Vector3 {
    const v = new Vector3();
    v.x = v1.x / v2.x;
    v.y = v1.y / v2.y;
    v.z = v1.z / v2.z;
    return v;
  }

  public inverse(): Vector3 {
    this.x = 1 / this.x;
    this.y = 1 / this.y;
    this.z = 1 / this.z;
    return this;
  }

  public static dot(v1: Vector3, v2: Vector3): number {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }

  public static cross(v1: Vector3, v2: Vector3): Vector3 {
    return new Vector3(
      v1.y * v2.z - v1.z * v2.y,
      v1.z * v2.x - v1.x * v2.z,
      v1.x * v2.y - v1.y * v2.x
    );
  }

  public static lerp(v1: Vector3, v2: Vector3, t: number): Vector3 {
    const v = new Vector3();
    v.x = v1.x + t * (v2.x - v1.x);
    v.y = v1.y + t * (v2.y - v1.y);
    v.z = v1.z + t * (v2.z - v1.z);
    return v;
  }

  public static angle(v1: Vector3, v2: Vector3): number {
    const l1 = v1.length;
    const l2 = v2.length;
    const cosine = l1 * l2 && Vector3.dot(v1, v2) / (l1 * l2);
    return Math.acos(cosine);
  }

  public normalize(): Vector3 {
    const length = this.length;
    if (length > 0.0001) {
      this.x = this.x / length;
      this.y = this.y / length;
      this.z = this.z / length;
    } else {
      this.x = 0;
      this.y = 0;
      this.z = 0;
    }
    return this;
  }

  public static normalize(v: Vector3): Vector3 {
    const t = new Vector3();
    const length = v.length;
    if (length > 0.0001) {
      t.x = v.x / length;
      t.y = v.y / length;
      t.z = v.z / length;
    } else {
      t.x = 0;
      t.y = 0;
      t.z = 0;
    }
    return t;
  }

  public zero(): Vector3 {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    return this;
  }

  public negate(): Vector3 {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
  }

  public min(v: Vector3): Vector3 {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);
    return this;
  }

  public static min(v1: Vector3, v2: Vector3) {
    const v = new Vector3();
    v.x = Math.min(v1.x, v2.x);
    v.y = Math.min(v1.y, v2.y);
    v.z = Math.min(v1.z, v2.z);
    return v;
  }

  public max(v: Vector3): Vector3 {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);
    return this;
  }

  public static max(v1: Vector3, v2: Vector3) {
    const v = new Vector3();
    v.x = Math.max(v1.x, v2.x);
    v.y = Math.max(v1.y, v2.y);
    v.z = Math.max(v1.z, v2.z);
    return v;
  }

  public clamp(min: Vector3, max: Vector3) {
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    this.z = Math.max(min.z, Math.min(max.z, this.z));
    return this;
  }

  // cosθv + (1-cosθ)(n·v)n + sinθ(n×v)
  public static rotate(v: Vector3, n: Vector3, angle: number): Vector3 {
    n = n.normalize();
    return Vector3.add(
      Vector3.add(
        Vector3.scale(v, Math.cos(angle)),
        Vector3.scale(n, (1 - Math.cos(angle)) * Vector3.dot(n, v))
      ),
      Vector3.scale(Vector3.cross(n, v), Math.sin(angle))
    );
  }

  public static fromArray(array: number[]): Vector3 {
    const v = new Vector3();
    v.x = array[0];
    v.y = array[1];
    v.z = array[2];
    return v;
  }

  public static toArray(v: Vector3): number[] {
    const array = [v.x, v.y, v.z];
    return array;
  }

  public static random(start: number = 0, end: number = 1): Vector3 {
    if (start > end) {
      [start, end] = [end, start];
    }
    const v = new Vector3();
    v.x = Math.random() * (start - end) + end;
    v.y = Math.random();
    v.z = Math.random();
    return v;
  }
}
