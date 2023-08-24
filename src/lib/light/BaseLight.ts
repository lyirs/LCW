import { LightType } from "../helper/light";
import { Color } from "../math/Color";
import { ObjectBase } from "../ObjectBase";

export class BaseLight extends ObjectBase {
  public color: Color;
  public intensity;
  public type: LightType = LightType.AMBIENT;
  constructor(color: Color = new Color(1, 1, 1), intensity: number = 1) {
    super();
    this.color = color;
    this.intensity = intensity;
  }
}
