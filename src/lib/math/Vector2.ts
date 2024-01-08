import { Vector3 } from "./Vector3";

export class Vector2 {
  public x: number = 0;
  public y: number = 0;
  constructor(x: number = 0, y?: number) {
    if (y === undefined) {
      this.set(x, x);
    } else {
      this.set(x, y);
    }
  }

  public set(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }

  public get xy(): number[] {
    return [this.x, this.y];
  }

  public copy(v: Vector2): Vector2 {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  public get lengthSquraed(): number {
    return this.x * this.x + this.y * this.y;
  }

  public get length(): number {
    return Math.sqrt(this.lengthSquraed);
  }

  public get manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y);
  }

  public static distanceSq(v1: Vector2, v2: Vector2): number {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    return dx * dx + dy * dy;
  }

  public static distance(v1: Vector2, v2: Vector2): number {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public static manhattanDistance(v1: Vector2, v2: Vector2): number {
    return Math.abs(v1.x - v2.x) + Math.abs(v1.y - v2.y);
  }

  public equals(v: Vector2): boolean {
    return this.x === v.x && this.y === v.y;
  }

  public static equals(v1: Vector2, v2: Vector2): boolean {
    return v1.x === v2.x && v1.y === v2.y;
  }

  public static floor(v: Vector2): Vector2 {
    const t = new Vector2();
    t.x = Math.floor(v.x);
    t.y = Math.floor(v.y);
    return t;
  }

  public static ceil(v: Vector2): Vector2 {
    const t = new Vector2();
    t.x = Math.ceil(v.x);
    t.y = Math.ceil(v.y);
    return t;
  }

  public static round(v: Vector2): Vector2 {
    const t = new Vector2();
    t.x = Math.round(v.x);
    t.y = Math.round(v.y);
    return t;
  }

  public add(v: Vector2): Vector2 {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  public static add(v1: Vector2, v2: Vector2): Vector2 {
    const v = new Vector2();
    v.x = v1.x + v2.x;
    v.y = v1.y + v2.y;
    return v;
  }

  public sub(v: Vector2): Vector2 {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  public static sub(v1: Vector2, v2: Vector2): Vector2 {
    const v = new Vector2();
    v.x = v1.x - v2.x;
    v.y = v1.y - v2.y;
    return v;
  }

  public scale(k: number): Vector2 {
    this.x *= k;
    this.y *= k;
    return this;
  }

  public static scale(v1: Vector2, k: number): Vector2 {
    const v = new Vector2();
    v.x = v1.x * k;
    v.y = v1.y * k;
    return v;
  }

  public mul(v: Vector2): Vector2 {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  }

  public static mul(v1: Vector2, v2: Vector2): Vector2 {
    const v = new Vector2();
    v.x = v1.x * v2.x;
    v.y = v1.y * v2.y;
    return v;
  }

  public divScalar(k: number): Vector2 {
    this.x /= k;
    this.y /= k;
    return this;
  }

  public static divScalar(v1: Vector2, k: number): Vector2 {
    const v = new Vector2();
    v.x = v1.x / k;
    v.y = v1.y / k;
    return v;
  }

  public div(v: Vector2): Vector2 {
    this.x /= v.x;
    this.y /= v.y;
    return this;
  }

  public static div(v1: Vector2, v2: Vector2): Vector2 {
    const v = new Vector2();
    v.x = v1.x / v2.x;
    v.y = v1.y / v2.y;
    return v;
  }

  public inverse(): Vector2 {
    this.x = 1 / this.x;
    this.y = 1 / this.y;
    return this;
  }

  public static dot(v1: Vector2, v2: Vector2): number {
    return v1.x * v2.x + v1.y * v2.y;
  }

  public static cross(v1: Vector2, v2: Vector2): Vector3 {
    return new Vector3(0, 0, v1.x * v2.y - v1.y * v2.x);
  }

  public static lerp(v1: Vector2, v2: Vector2, t: number): Vector2 {
    const v = new Vector2();
    v.x = v1.x + t * (v2.x - v1.x);
    v.y = v1.y + t * (v2.y - v1.y);
    return v;
  }

  public static angle(v1: Vector2, v2: Vector2): number {
    const l1 = v1.length;
    const l2 = v2.length;
    const cosine = l1 * l2 && Vector2.dot(v1, v2) / (l1 * l2);
    return Math.acos(cosine);
  }

  public normalize(): Vector2 {
    const length = this.length;
    if (length > 0.0001) {
      this.x = this.x / length;
      this.y = this.y / length;
    } else {
      this.x = 0;
      this.y = 0;
    }
    return this;
  }

  public static normalize(v: Vector2): Vector2 {
    const t = new Vector2();
    const length = v.length;
    if (length > 0.0001) {
      t.x = v.x / length;
      t.y = v.y / length;
    } else {
      t.x = 0;
      t.y = 0;
    }
    return t;
  }

  public zero(): Vector2 {
    this.x = 0;
    this.y = 0;
    return this;
  }

  public negate(): Vector2 {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }

  public min(v: Vector2): Vector2 {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    return this;
  }

  public static min(v1: Vector2, v2: Vector2) {
    const v = new Vector2();
    v.x = Math.min(v1.x, v2.x);
    v.y = Math.min(v1.y, v2.y);
    return v;
  }

  public max(v: Vector2): Vector2 {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    return this;
  }

  public static max(v1: Vector2, v2: Vector2) {
    const v = new Vector2();
    v.x = Math.max(v1.x, v2.x);
    v.y = Math.max(v1.y, v2.y);
    return v;
  }

  public clamp(min: Vector2, max: Vector2) {
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    return this;
  }

  public static fromArray(array: number[]): Vector2 {
    const v = new Vector2();
    v.x = array[0];
    v.y = array[1];
    return v;
  }

  public static toArray(v: Vector2): number[] {
    const array = [v.x, v.y];
    return array;
  }

  public static random(start: number = 0, end: number = 1): Vector2 {
    if (start > end) {
      [start, end] = [end, start];
    }
    const v = new Vector2();
    v.x = Math.random() * (start - end) + end;
    v.y = Math.random();
    return v;
  }

  public static transformMatrix4(v: Vector2, m: Matrix4): Vector2 {
    const dst = new Vector2();
    const x = v.x;
    const y = v.y;

    dst.x = m[0] * x + m[4] * y + m[12];
    dst.y = m[1] * x + m[5] * y + m[13];

    return dst;
  }
}
