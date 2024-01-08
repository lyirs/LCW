import vertWGSL from "./shader/axes.vert.wgsl?raw";
import fragWGSL from "./shader/axes.frag.wgsl?raw";
import {
  CreateGPUBufferF32,
  CreateUniformBuffer,
} from "../../auxiliary/gpuBuffer";
import { Camera } from "../../core/Camera";
import { GPUManager } from "../../core/GPUManager";
import { Vector3 } from "../../math/Vector3";
import { GeometryBase } from "../GeometryBase";
import { Matrix4 } from "../../math/Matrix4";

// prettier-ignore
const axesVertexArray = new Float32Array([
  0, 0, 0, 1, 
  1, 0, 0, 1, 
  0, 0, 0, 1, 
  0, 1, 0, 1, 
  0, 0, 0, 1, 
  0, 0, 1, 1,
]);

export class Axes extends GeometryBase {
  public pipeline: GPURenderPipeline;
  public uniformBuffer: any;
  public uniformBindGroup: any;
  public vertexBuffer: GPUBuffer;
  public vertexCount: number;
  public device: GPUDevice;
  constructor(length: number = 1) {
    super();
    const gpuManager = GPUManager.getInstance();
    const device = gpuManager.device as GPUDevice;
    const format = gpuManager.format as GPUTextureFormat;

    this.device = device;

    this.setScale(new Vector3(length));

    this.vertexBuffer = CreateGPUBufferF32(axesVertexArray);

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
            arrayStride: 4 * 4, // 顶点长度 以字节为单位
            attributes: [
              // position
              {
                shaderLocation: 0,
                offset: 0,
                format: "float32x4",
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
        topology: "line-list",
      },
      // 深度
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: "less",
        format: "depth32float",
      },
      // 多重采样
      multisample:
        gpuManager.sampleCount > 1
          ? {
              count: 4,
            }
          : undefined,
    });

    this.uniformBuffer = CreateUniformBuffer(4 * 4 * 4);

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

    this.vertexCount = 6;
  }

  public render(
    renderPass: GPURenderPassEncoder | GPURenderBundleEncoder,
    camera: Camera
  ) {
    const vpMatrix = Matrix4.multiply(
      camera.projectionMatrix,
      camera.viewMatrix
    );

    const mvpMatrix = Matrix4.multiply(vpMatrix, this.modelMatrix);
    this.device.queue.writeBuffer(this.uniformBuffer, 0, mvpMatrix);
    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, this.uniformBindGroup);
    renderPass.setVertexBuffer(0, this.vertexBuffer);
    renderPass.draw(this.vertexCount, 1);
  }
}
