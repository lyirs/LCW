import { mat4, Mat4, vec3 } from "wgpu-matrix";
import { Color } from "../math/Color";
import { Vector3 } from "../math/Vector3";

export class GeometryBase {
  public uniformBuffer: any;
  public uniformBindGroup: any;
  public position: Vector3 = new Vector3(0, 0, 0);
  public scale: Vector3 = new Vector3(1, 1, 1);
  public rotation: Vector3 = new Vector3(0, 0, 0);
  public color: Color = new Color(1, 1, 1);

  protected _modelMatrix: Mat4 = mat4.identity();
  public castShadow: boolean = false;

  constructor() {}

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

  public set x(x: number) {
    this.position.x = x;
    this._modelMatrix = mat4.translate(
      this._modelMatrix,
      vec3.fromValues(this.position.x, this.position.y, this.position.z)
    );
  }

  public set y(y: number) {
    this.position.y = y;
    this._modelMatrix = mat4.translate(
      this._modelMatrix,
      vec3.fromValues(this.position.x, this.position.y, this.position.z)
    );
  }

  public set z(z: number) {
    this.position.z = z;
    this._modelMatrix = mat4.translate(
      this._modelMatrix,
      vec3.fromValues(this.position.x, this.position.y, this.position.z)
    );
  }

  public setScale(scale: Vector3) {
    this.scale = scale;
    this._modelMatrix = mat4.scale(
      this._modelMatrix,
      vec3.fromValues(scale.x, scale.y, scale.z)
    );
  }

  public set scaleX(value: number) {
    this.scale.x = value;
    this._modelMatrix = mat4.scale(
      this._modelMatrix,
      vec3.fromValues(this.scale.x, this.scale.y, this.scale.z)
    );
  }

  public set scaleY(value: number) {
    this.scale.y = value;
    this._modelMatrix = mat4.scale(
      this._modelMatrix,
      vec3.fromValues(this.scale.x, this.scale.y, this.scale.z)
    );
  }

  public set scaleZ(value: number) {
    this.scale.z = value;
    this._modelMatrix = mat4.scale(
      this._modelMatrix,
      vec3.fromValues(this.scale.x, this.scale.y, this.scale.z)
    );
  }

  public setRotation(rotation: Vector3) {
    this.rotation = rotation;
    this._modelMatrix = mat4.rotateX(this._modelMatrix, rotation.x);
    this._modelMatrix = mat4.rotateY(this._modelMatrix, rotation.y);
    this._modelMatrix = mat4.rotateZ(this._modelMatrix, rotation.z);
  }

  public set rotateX(value: number) {
    this.rotation.x = value;
    this._modelMatrix = mat4.rotateX(this._modelMatrix, value);
  }

  public set rotateY(value: number) {
    this.rotation.y = value;
    this._modelMatrix = mat4.rotateX(this._modelMatrix, value);
  }

  public set rotateZ(value: number) {
    this.rotation.z = value;
    this._modelMatrix = mat4.rotateX(this._modelMatrix, value);
  }

  public get modelMatrix(): Mat4 {
    return this._modelMatrix;
  }
}
