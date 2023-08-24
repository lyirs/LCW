import { Camera } from "../core/Camera";
import { Vector3 } from "../math/Vector3";

export class BaseObject {
  public position: Vector3 = new Vector3(0, 0, 0);

  constructor() {}

  public render(renderPass: GPURenderPassEncoder, camera: Camera) {}
}
