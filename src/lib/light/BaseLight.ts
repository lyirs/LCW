import { LightType } from "../auxiliary/light";
import { Color } from "../math/Color";

export class BaseLight {
  public color: Color;
  public intensity;
  public type: LightType = LightType.AMBIENT;
  constructor(color: Color = new Color(1, 1, 1), intensity: number = 1) {
    this.color = color;
    this.intensity = intensity;
  }
}
