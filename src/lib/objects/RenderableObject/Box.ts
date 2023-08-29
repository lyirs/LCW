import { RenderableObject } from "./RenderableBase";
import {
  CreateGPUBufferF32,
  CreateGPUBufferUint16,
} from "../../auxiliary/gpuBuffer";
import { GPUManager } from "../../core/GPUManager";

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

// prettier-ignore
const boxWireframeIndexArray = new Uint16Array([
  8,9,
  9,11,
  11,10,
  10,8, // top
  14,15,
  15,13,
  13,12,
  12,14, // bottom
  11,13,
  9,15,
  8,14,
  10,12, // side
])

export class Box extends RenderableObject {
  constructor(W = 1, H = 1, D = 1) {
    super();
    this.vertices = boxVertexArray(W, H, D);
    this.indices = boxIndexArray;
    this.renderBuffer = {
      vertex: CreateGPUBufferF32(this.vertices),
      index: CreateGPUBufferUint16(this.indices),
    };
    this.wireframeIndices = boxWireframeIndexArray;
  }
}

export class Cube extends RenderableObject {
  private static sharedVertexBuffer: GPUBuffer | null = null;
  private static sharedIndexBuffer: GPUBuffer | null = null;
  public static vertexCount: number = 36;
  public static renderBuffer: { vertex: GPUBuffer; index: GPUBuffer };
  constructor() {
    super();
    this.vertices = boxVertexArray(1, 1, 1);
    this.indices = boxIndexArray;

    if (!Cube.sharedVertexBuffer || !Cube.sharedIndexBuffer) {
      Cube.sharedVertexBuffer = CreateGPUBufferF32(boxVertexArray(1, 1, 1));
      Cube.sharedIndexBuffer = CreateGPUBufferUint16(boxIndexArray);
    }
    this.renderBuffer = {
      vertex: Cube.sharedVertexBuffer,
      index: Cube.sharedIndexBuffer,
    };
    Cube.renderBuffer = this.renderBuffer;
    this.wireframeIndices = boxWireframeIndexArray;
  }
}
