import {
  CreateGPUBufferF32,
  CreateGPUBufferUint16,
  CreateUniformBUffer,
} from "../helper/gpuBuffer";
import { RenderableObject } from "./RenderableObject";

import { lightBindGroupEntries } from "../helper/light";
import { CreateBindGroupWithLayout } from "../helper/bindGroup";

const boxVertexSize = 8 * 4;
const boxPositionOffset = 0;
const boxNormalOffset = 3 * 4;
const boxUvOffset = 6 * 4;

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
  public vertexBuffer: GPUBuffer;
  public indexBuffer: GPUBuffer;
  public vertexCount: number;
  private vertices: Float32Array;
  private indices: Uint16Array;
  public width: number;
  public height: number;
  public depth: number;

  constructor(width: number = 1, height: number = 1, depth: number = 1) {
    super();

    this.width = width;
    this.height = height;
    this.depth = depth;

    this.vertices = boxVertexArray(this.width, this.height, this.depth);

    this.indices = boxIndexArray;

    this.vertexCount = this.indices.length;

    this.vertexBuffer = CreateGPUBufferF32(this.device, this.vertices);
    this.indexBuffer = CreateGPUBufferUint16(this.device, this.indices);

    this.lightBindGroupEntries = lightBindGroupEntries(this.device);
  }
}
