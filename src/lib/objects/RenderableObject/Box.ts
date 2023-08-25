import {
  CreateGPUBufferF32,
  CreateGPUBufferUint16,
} from "../../helper/gpuBuffer";
import { RenderableObject } from "./RenderableBase";

// TODO： tangents
// prettier-ignore
const boxVertexArray = (W:number,H:number,D:number) => new Float32Array([
  // float3 position, float3 normal, float2 uv
  W,H,D,    1,0,0,      0,1,
  W,H,-D,   1,0,0,      1,1,
  W,-H,D,   1,0,0,      0,0,
  W,-H,-D,  1,0,0,      1,0,
  -W,H,-D,  -1,0,0,     0,1,
  -W,H,D,   -1,0,0,     1,1,
  -W,-H,-D, -1,0,0,     0,0,
  -W,-H,D,  -1,0,0,     1,0,
  -W,H,-D,  0,1,0,      0,1,
  W,H,-D,   0,1,0,      1,1,
  -W,H,D,   0,1,0,      0,0,
  W,H,D,    0,1,0,      1,0,
  -W,-H,D,  0,-1,0,     0,1,
  W,-H,D,   0,-1,0,     1,1,
  -W,-H,-D, 0,-1,0,     0,0,
  W,-H,-D,  0,-1,0,     1,0,
  -W,H,D,   0,0,1,      0,1,
  W,H,D,    0,0,1,      1,1,
  -W,-H,D,  0,0,1,      0,0,
  W,-H,D,   0,0,1,      1,0,
  W,H,-D,   0,0,-1,     0,1,
  -W,H,-D,  0,0,-1,     1,1,
  W,-H,-D,  0,0,-1,     0,0,
  -W,-H,-D, 0,0,-1,     1,0
])
// prettier-ignore
const boxIndexArray = new Uint16Array([
  0,2,1,
  2,3,1,
  4,6,5,
  6,7,5,
  8,10,9,
  10,11,9,
  12,14,13,
  14,15,13,
  16,18,17,
  18,19,17,
  20,22,21,
  22,23,21
])

export class Box extends RenderableObject {
  public vertexCount: number;
  private vertices: Float32Array;
  private indices: Uint16Array;
  public static vertex = boxVertexArray(0.5, 0.5, 0.5);
  public static index = boxIndexArray;

  constructor() {
    super();
    this.vertices = boxVertexArray(1, 1, 1);
    this.indices = boxIndexArray;
    this.vertexCount = this.indices.length;
  }
}
