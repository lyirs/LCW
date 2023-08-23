import { RenderableObject } from "../shape/RenderableObject";
enum LightType {
  DIRECTIONAL,
  POINT,
  SPOT,
}
export class BaseLight extends RenderableObject {
  public color: { r: number; g: number; b: number } = { r: 1, g: 1, b: 1 };
  public intensity: number = 1.0;
  public type: LightType = LightType.DIRECTIONAL;
  constructor(color: { r: number; g: number; b: number }, intensity: number) {
    super();
    this.color = color;
    this.intensity = intensity;
  }
}
