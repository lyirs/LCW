export class Color {
  r: number;
  g: number;
  b: number;
  a: number = 1.0;
  constructor(hex: string);
  constructor(r: number, g: number, b: number, a?: number);
  constructor(r: string | number, g?: number, b?: number, a?: number) {
    if (typeof r === "string") {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(r);
      if (result) {
        this.r = parseInt(result[1], 16) / 255.0;
        this.g = parseInt(result[2], 16) / 255.0;
        this.b = parseInt(result[3], 16) / 255.0;
      } else {
        throw new Error("Invalid color format. Use hex format: #RRGGBB");
      }
    } else {
      if (g === undefined || b === undefined) {
        throw new Error("Invalid arguments.");
      }

      this.r = r;
      this.g = g;
      this.b = b;
      if (a) {
        this.a = a;
      }
    }
  }

  get rgba(): number[] {
    return [this.r, this.g, this.b, this.a];
  }

  clone() {
    return new Color(this.r, this.g, this.b, this.a);
  }

  lerp(targetColor: Color, alpha: number) {
    this.r += (targetColor.r - this.r) * alpha;
    this.g += (targetColor.g - this.g) * alpha;
    this.b += (targetColor.b - this.b) * alpha;
    return this;
  }
}
