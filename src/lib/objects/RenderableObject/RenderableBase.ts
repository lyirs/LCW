import { mat4, Mat4, vec3 } from "wgpu-matrix";
import { GPUManager } from "../../core/GPUManager";

import { Vector3 } from "../../math/Vector3";
import { GeometryBase } from "../GeometryBase";

export class RenderableObject extends GeometryBase {
  public device: GPUDevice;
  public shadowBindGroup: GPUBindGroup | null = null;
  public position: Vector3 = new Vector3(0, 0, 0);
  public scale: Vector3 = new Vector3(1, 1, 1);
  public rotation: Vector3 = new Vector3(0, 0, 0);
  protected _modelMatrix: Mat4 = mat4.identity(); // 模型矩阵

  constructor() {
    super();
    const gpuManager = GPUManager.getInstance();
    const device = gpuManager.device as GPUDevice;
    this.device = device;
  }

  public get modelMatrix(): Mat4 {
    return this._modelMatrix;
  }
}
