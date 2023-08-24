import { Camera } from "../core/Camera";

export class BaseObject {
  public position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };

  constructor() {}

  public render(renderPass: GPURenderPassEncoder, camera: Camera) {}
}
