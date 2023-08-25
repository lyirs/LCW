import { mat4, Mat4, vec3 } from "wgpu-matrix";
import { Camera } from "../../core/Camera";
import { GPUManager } from "../../core/GPUManager";
import {
  CreateBindGroup,
  CreateBindGroupLayout,
  CreateBindGroupWithLayout,
} from "../../helper/bindGroup";
import {
  CreateGPUBufferF32,
  CreateGPUBufferUint16,
  CreateUniformBUffer,
} from "../../helper/gpuBuffer";
import {
  createRenderPipeLineWithLayout,
  setPipelineVertexBuffer,
} from "../../helper/renderProgram";

import { Vector3 } from "../../math/Vector3";
import { GeometryBase } from "../GeometryBase";
import vertWGSL from "./shader/base.vert.wgsl?raw";
import fragWGSL from "./shader/base.frag.wgsl?raw";

export class RenderableObject extends GeometryBase {
  public device: GPUDevice;
  public pipeline: GPURenderPipeline | undefined;
  public shadowPipeline: GPURenderPipeline | undefined;
  public vertexBuffer: GPUBuffer;
  public indexBuffer: GPUBuffer;
  public vertexCount: number;
  public shadowBindGroup: GPUBindGroup | null = null;
  protected _vsBindGroupLayout: GPUBindGroupLayout;
  public position: Vector3 = new Vector3(0, 0, 0);
  public scale: Vector3 = new Vector3(1, 1, 1);
  public rotation: Vector3 = new Vector3(0, 0, 0);
  protected _modelMatrix: Mat4 = mat4.identity(); // 模型矩阵

  constructor() {
    super();
    const gpuManager = GPUManager.getInstance();
    const device = gpuManager.device as GPUDevice;
    this.device = device;
    this.vertexBuffer = CreateGPUBufferF32(device, new Float32Array());
    this.indexBuffer = CreateGPUBufferUint16(device, new Uint16Array());
    this.vertexCount = 0;

    this._vsBindGroupLayout = CreateBindGroupLayout(device, [
      GPUShaderStage.VERTEX,
      GPUShaderStage.VERTEX,
    ]);

    this.uniformBuffer = CreateUniformBUffer(this.device, 4 * 4 * 4 * 4);
  }

  public setPipeline(
    lightBindGroupLayout: GPUBindGroupLayout,
    lightProjectionBuffer: GPUBuffer
  ) {
    this.uniformBindGroup = CreateBindGroupWithLayout(
      this.device,
      this._vsBindGroupLayout,
      [
        { binding: 0, resource: this.uniformBuffer },
        { binding: 1, resource: lightProjectionBuffer },
      ]
    );

    const pipelineBuffer = setPipelineVertexBuffer(
      ["float32x3", "float32x3", "float32x2"],
      [0, 3 * 4, 6 * 4]
    );

    this.pipeline = createRenderPipeLineWithLayout(
      "pipeline",
      [this._vsBindGroupLayout, lightBindGroupLayout],
      vertWGSL,
      fragWGSL,
      pipelineBuffer
    );

    this.shadowPipeline = this.device.createRenderPipeline({
      label: "shadow",
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [this._vsBindGroupLayout],
      }),
      // 只需要得到顶点深度结果，不需要片元着色器
      vertex: {
        module: this.device.createShaderModule({
          code: vertWGSL,
        }),
        entryPoint: "shadow",
        buffers: pipelineBuffer,
      },
      primitive: {
        topology: "triangle-list",
        cullMode: "back",
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: "less",
        format: "depth32float",
      },
    });

    this.shadowBindGroup = CreateBindGroup(
      this.device,
      this.shadowPipeline,
      0,
      [
        { binding: 0, resource: this.uniformBuffer },
        { binding: 1, resource: lightProjectionBuffer },
      ]
    );
  }

  public get modelMatrix(): Mat4 {
    return this._modelMatrix;
  }

  public render(
    renderPass: GPURenderPassEncoder,
    camera: Camera,
    lightBindGroup: GPUBindGroup
  ) {
    this.device.queue.writeBuffer(
      this.uniformBuffer,
      0,
      camera.projectionMatrix as Float32Array
    );
    this.device.queue.writeBuffer(
      this.uniformBuffer,
      4 * 4 * 4,
      camera.viewMatrix as Float32Array
    );
    this.device.queue.writeBuffer(
      this.uniformBuffer,
      4 * 4 * 4 * 2,
      this.modelMatrix as Float32Array
    );

    let normalMatrix = mat4.copy(this.modelMatrix);
    normalMatrix = mat4.invert(normalMatrix);
    normalMatrix = mat4.transpose(normalMatrix) as Float32Array;
    this.device.queue.writeBuffer(
      this.uniformBuffer,
      4 * 4 * 4 * 3,
      normalMatrix
    );

    renderPass.setPipeline(this.pipeline as GPURenderPipeline);
    renderPass.setBindGroup(0, this.uniformBindGroup);
    renderPass.setBindGroup(1, lightBindGroup);
    renderPass.setVertexBuffer(0, this.vertexBuffer);
    renderPass.setIndexBuffer(this.indexBuffer, "uint16");
    renderPass.drawIndexed(this.vertexCount);
  }

  public renderShadow(
    commandEncoder: GPUCommandEncoder,
    shadowDepthView: GPUTextureView
  ) {
    if (this.castShadow) {
      const shadowPass = commandEncoder.beginRenderPass({
        colorAttachments: [],
        depthStencilAttachment: {
          view: shadowDepthView,
          depthClearValue: 1.0,
          depthLoadOp: "clear",
          depthStoreOp: "store",
        },
      });
      shadowPass.setPipeline(this.shadowPipeline as GPURenderPipeline);
      shadowPass.setBindGroup(0, this.shadowBindGroup);
      shadowPass.setVertexBuffer(0, this.vertexBuffer);
      shadowPass.setIndexBuffer(this.indexBuffer, "uint16");
      shadowPass.drawIndexed(this.vertexCount);
      shadowPass.end();
    }
  }
}
