import { BaseLight } from "./BaseLight";
enum LightType {
  DIRECTIONAL,
  POINT,
  SPOT,
}
export class DirectionalLight extends BaseLight {
  constructor(color: { r: number; g: number; b: number }, intensity: number) {
    super(color, intensity);
    this.type = LightType.DIRECTIONAL;
  }
}
