import vertWGSL from "./shader/box.vert.wgsl?raw";
import fragWGSL from "./shader/box.frag.wgsl?raw";
import { mat4, vec3 } from "wgpu-matrix";
import { Camera } from "../core/Camera";
import { GPUManager } from "../core/GPUManager";
import {
  CreateGPUBufferF32,
  CreateGPUBufferUint16,
  CreateUniformBUffer,
} from "../helper/gpuBuffer";
import { RenderableObject } from "./RenderableObject";

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
  public pipeline: GPURenderPipeline;
  public uniformBuffer: any;
  public uniformBindGroup: any;
  public vertexBuffer: GPUBuffer;
  public indexBuffer: GPUBuffer;
  public vertexCount: number;
  public device: GPUDevice;
  private vertices: Float32Array;
  private indices: Uint16Array;
  public width: number;
  public height: number;
  public depth: number;

  constructor(width: number = 1, height: number = 1, depth: number = 1) {
    super();

    const gpuManager = GPUManager.getInstance();
    const device = gpuManager.device as GPUDevice;
    const format = gpuManager.format as GPUTextureFormat;

    this.width = width;
    this.height = height;
    this.depth = depth;

    this.vertices = boxVertexArray(this.width, this.height, this.depth);

    this.indices = boxIndexArray;

    this.vertexCount = this.indices.length;

    this.device = device;
    this.vertexBuffer = CreateGPUBufferF32(device, this.vertices);
    this.indexBuffer = CreateGPUBufferUint16(device, this.indices);

    this.pipeline = device.createRenderPipeline({
      // 布局
      layout: "auto",
      // 顶点着色器
      vertex: {
        module: device.createShaderModule({
          code: vertWGSL,
        }),
        entryPoint: "main",
        buffers: [
          // 缓冲区集合，其中一个元素对应一个缓冲对象
          {
            arrayStride: boxVertexSize, // 顶点长度 以字节为单位
            attributes: [
              // position
              {
                shaderLocation: 0,
                offset: boxPositionOffset,
                format: "float32x3",
              },
              // normal
              {
                shaderLocation: 1,
                offset: boxNormalOffset,
                format: "float32x3",
              },
              // uv
              {
                shaderLocation: 2,
                offset: boxUvOffset,
                format: "float32x2",
              },
            ],
          },
        ],
      },
      // 片元着色器
      fragment: {
        module: device.createShaderModule({
          code: fragWGSL,
        }),
        entryPoint: "main",
        // 输出颜色
        targets: [
          {
            format: format,
          },
        ],
      },
      // 图元类型
      primitive: {
        topology: "triangle-list",
        cullMode: "back",
      },
      // 深度
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: "less",
        format: "depth24plus",
      },
      // 多重采样
      multisample:
        gpuManager.sampleCount > 1
          ? {
              count: 4,
            }
          : undefined,
    });

    this.uniformBuffer = CreateUniformBUffer(this.device, 4 * 4 * 4);

    this.uniformBindGroup = device.createBindGroup({
      label: "uniform",
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.uniformBuffer,
          },
        },
      ],
    });
  }

  public render(renderPass: GPURenderPassEncoder, camera: Camera) {
    const vpMatrix = mat4.multiply(camera.projectionMatrix, camera.viewMatrix);

    const mvpMatrix = mat4.multiply(vpMatrix, this.modelMatrix) as Float32Array;

    this.device.queue.writeBuffer(this.uniformBuffer, 0, mvpMatrix);
    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, this.uniformBindGroup);
    renderPass.setVertexBuffer(0, this.vertexBuffer);
    renderPass.setIndexBuffer(this.indexBuffer, "uint16");
    renderPass.drawIndexed(this.vertexCount);
  }
}
