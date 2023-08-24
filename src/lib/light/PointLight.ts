import { LightType } from "../helper/light";
import { Color } from "../math/Color";
import { Vector3 } from "../math/Vector3";
import { BaseLight } from "./BaseLight";

export class PointLight extends BaseLight {
  public array = new Float32Array(8);
  public radius: number;

  constructor(
    position: Vector3 = new Vector3(0, 0, 0),
    color: Color = new Color(1, 1, 1),
    intensity: number = 1,
    radius: number = 1
  ) {
    super(color, intensity);
    this.position = position;
    this.radius = radius;
    this.type = LightType.POINT;
    this.array[0] = this.position.x;
    this.array[1] = this.position.y;
    this.array[2] = this.position.z;
    this.array[3] = this.intensity;
    this.array[4] = this.color.r;
    this.array[5] = this.color.g;
    this.array[6] = this.color.b;
    this.array[7] = this.radius;
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

  public setRadius(radius: number) {
    this.radius = radius;
    this.array[7] = this.radius;
  }

  public setPosition(position: Vector3) {
    this.position = position;
    this.array[0] = this.position.x;
    this.array[1] = this.position.y;
    this.array[2] = this.position.z;
  }
}
