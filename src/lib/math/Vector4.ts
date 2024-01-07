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
}
