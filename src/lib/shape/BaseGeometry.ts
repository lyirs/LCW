import { mat4, Mat4, vec3 } from "wgpu-matrix";
import { Camera } from "../core/Camera";
import { LightType } from "../helper/light";
import { BaseLight } from "../light/BaseLight";
import { Vector3 } from "../math/Vector3";
import { BaseObject } from "./BaseObject";

export class BaseGeometry extends BaseObject {
  public uniformBuffer: any;
  public uniformBindGroup: any;
  public position: Vector3 = new Vector3(0, 0, 0);
  public scale: Vector3 = new Vector3(1, 1, 1);
  public rotation: Vector3 = new Vector3(0, 0, 0);
  protected _modelMatrix: Mat4 = mat4.identity();

  constructor() {
    super();
  }

  public set(position: Vector3, scale: Vector3, rotation: Vector3) {
    this.position = position;
    this.scale = scale;
    this.rotation = rotation;
    this._modelMatrix = mat4.translate(
      this._modelMatrix,
      vec3.fromValues(position.x, position.y, position.z)
    );
    this._modelMatrix = mat4.rotateX(this._modelMatrix, rotation.x);
    this._modelMatrix = mat4.rotateY(this._modelMatrix, rotation.y);
    this._modelMatrix = mat4.rotateZ(this._modelMatrix, rotation.z);
    this._modelMatrix = mat4.scale(
      this._modelMatrix,
      vec3.fromValues(scale.x, scale.y, scale.z)
    );
  }

  public setPosition(position: Vector3) {
    this.position = position;
    this._modelMatrix = mat4.translate(
      this._modelMatrix,
      vec3.fromValues(position.x, position.y, position.z)
    );
  }

  public setScale(scale: Vector3) {
    this.scale = scale;
    this._modelMatrix = mat4.scale(
      this._modelMatrix,
      vec3.fromValues(scale.x, scale.y, scale.z)
    );
  }

  public setRotation(rotation: Vector3) {
    this.rotation = rotation;
    this._modelMatrix = mat4.rotateX(this._modelMatrix, rotation.x);
    this._modelMatrix = mat4.rotateY(this._modelMatrix, rotation.y);
    this._modelMatrix = mat4.rotateZ(this._modelMatrix, rotation.z);
  }
  public get modelMatrix(): Mat4 {
    return this._modelMatrix;
  }

  public setLightBuffer(lights: Map<LightType, BaseLight[]>): void {}
  public render(renderPass: GPURenderPassEncoder, camera: Camera) {}
}
