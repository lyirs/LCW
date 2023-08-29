import { LightType } from "../auxiliary/light";
import { Color } from "../math/Color";
import { BaseLight } from "./BaseLight";

export class AmbientLight extends BaseLight {
  public array = new Float32Array(8);

  constructor(color: Color = new Color(1, 1, 1), intensity: number = 1) {
    super(color, intensity);
    this.type = LightType.AMBIENT;
    this.array[3] = this.intensity;
    this.array[4] = this.color.r;
    this.array[5] = this.color.g;
    this.array[6] = this.color.b;
  }

  public setColor(color: Color) {
    this.color = color;
    this.array[4] = color.r;
    this.array[5] = color.g;
    this.array[6] = color.b;
  }

  public setIntensity(intensity: number) {
    this.intensity = intensity;
    this.array[3] = intensity;
  }
}
