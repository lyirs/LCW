import { LightType } from "../helper/light";
import { Color } from "../math/Color";
import { BaseObject } from "../shape/BaseObject";

export class BaseLight extends BaseObject {
  public color: Color;
  public intensity;
  public type: LightType = LightType.DIRECTIONAL;
  constructor(color: Color = new Color(1, 1, 1), intensity: number = 1) {
    super();
    this.color = color;
    this.intensity = intensity;
  }
}
