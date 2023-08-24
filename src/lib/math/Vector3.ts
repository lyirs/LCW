export class Vector3 {
  public x: number = 0;
  public y: number = 0;
  public z: number = 0;
  constructor(x: number, y?: number, z?: number) {
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
}
