import { Matrix4 } from "../math/Matrix4";
import { Vector3 } from "../math/Vector3";

export class Camera {
  private _eyePosition = new Vector3(0, 0, 0);
  private _center = new Vector3(0, 0, 0);
  private _up = new Vector3(0, 1, 0);
  private _projectionMatrix: Matrix4 = Matrix4.identity();
  private _viewMatrix: Matrix4 = Matrix4.identity();
  private _viewProjectionMatrix: Matrix4 = Matrix4.identity();
  private _angularSpeed: number = 0.01;
  private _phi: number = Math.PI / 2;
  private _theta: number = Math.PI / 2;
  private _aspect: number = 1;
  private _fov: number = (60 / 180) * Math.PI;
  private _near: number = 0.1;
  private _far: number = 100.0;

  private static ZOOM_IN_FACTOR = 1.05;
  private static ZOOM_OUT_FACTOR = 0.95;

  constructor() {}

  public get projectionMatrix(): Matrix4 {
    return this._projectionMatrix;
  }

  public set projectionMatrix(matrix: Matrix4) {
    this._projectionMatrix = matrix;
  }

  public perspective(
    aspect: number = 1,
    fov: number = (60 / 180) * Math.PI,
    near: number = 0.1,
    far: number = 100.0
  ) {
    this._fov = fov;
    this._aspect = aspect;
    this._near = near;
    this._far = far;
    const projectionMatrix = Matrix4.perspective(
      this._fov,
      this._aspect,
      this._near,
      this._far
    ); // 创建一个透视投影
    this._projectionMatrix = projectionMatrix;
  }

  public set aspect(aspect: number) {
    this._aspect = aspect;
    const projectionMatrix = Matrix4.perspective(
      this._fov,
      this._aspect,
      this._near,
      this._far
    );
    this._projectionMatrix = projectionMatrix;
  }

  public ortho(
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number = 1,
    far: number = 1000
  ) {
    const projectionMatrix = Matrix4.ortho(left, right, bottom, top, near, far); // 创建一个正交投影矩阵
    this._projectionMatrix = projectionMatrix;
  }

  public get viewMatrix(): Matrix4 {
    return this._viewMatrix;
  }

  public set viewMatrix(matrix: Matrix4) {
    this._viewMatrix = matrix;
  }

  public lookAt(
    eyePosition = new Vector3(0, 0, 0),
    center = new Vector3(0, 0, 0),
    up = new Vector3(0, 1, 0)
  ) {
    const viewMatrix = Matrix4.lookAt(
      new Vector3(eyePosition.x, eyePosition.y, eyePosition.z),
      new Vector3(center.x, center.y, center.z),
      new Vector3(up.x, up.y, up.z)
    );
    this._eyePosition = eyePosition;
    this._center = center;
    this._up = up;
    this._viewMatrix = viewMatrix;
  }

  public get viewProjectionMatrix(): Matrix4 {
    const viewMatrix = this._viewMatrix;
    const projectionMatrix = this._projectionMatrix;
    this._viewProjectionMatrix = Matrix4.multiply(projectionMatrix, viewMatrix);
    return this._viewProjectionMatrix;
  }

  public set eye(eye: Vector3) {
    this._eyePosition = eye;
  }

  public rotateAroundObject_xz(
    objectPosition: Vector3,
    radius: number,
    deltaTime: number
  ) {
    const angularSpeed = 0.5;
    const angle = angularSpeed * deltaTime;
    const newX = objectPosition.x + radius * Math.cos(angle);
    const newZ = objectPosition.z + radius * Math.sin(angle);

    this.lookAt(new Vector3(newX, this._eyePosition.y, newZ), objectPosition);
  }

  public rotateAroundCenter(deltaX: number, deltaY: number) {
    // TODO
    const horizontalAngle = deltaX * this._angularSpeed;
    const verticalAngle = deltaY * this._angularSpeed;

    this._theta += horizontalAngle;
    this._phi -= verticalAngle;

    this._phi = Math.max(0.01, Math.min(Math.PI - 0.01, this._phi));

    const radius = Vector3.distance(
      new Vector3(
        this._eyePosition.x,
        this._eyePosition.y,
        this._eyePosition.z
      ),
      new Vector3(0, 0, 0)
    );

    const x = radius * Math.sin(this._phi) * Math.cos(this._theta);
    const y = radius * Math.cos(this._phi);
    const z = radius * Math.sin(this._phi) * Math.sin(this._theta);

    this.lookAt(new Vector3(x, y, z), this._center, new Vector3(0, 1, 0));
  }

  public mouseZoom(delta: number) {
    let speed = delta > 0 ? Camera.ZOOM_IN_FACTOR : Camera.ZOOM_OUT_FACTOR;
    this._eyePosition.x = this._eyePosition.x * speed;
    this._eyePosition.y = this._eyePosition.y * speed;
    this._eyePosition.z = this._eyePosition.z * speed;
    this.lookAt(this._eyePosition, this._center, this._up);
  }

  public getEyePositionFromViewMatrix(): Vector3 {
    const invView = Matrix4.invert(this._viewMatrix);
    if (!invView) {
      throw new Error("Failed to invert the view matrix");
    }
    const eyePosition = new Vector3(invView[12], invView[13], invView[14]);
    return eyePosition;
  }
}
