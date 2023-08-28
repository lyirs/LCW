import { mat4, Mat4, vec3 } from "wgpu-matrix";
import { Camera } from "../../core/Camera";
import { GPUManager } from "../../core/GPUManager";
import {
  CreateGPUBufferF32,
  CreateGPUBufferUint16,
  CreateUniformBuffer,
} from "../../helper/gpuBuffer";
import vertWGSL from "./shader/wireframe.vert.wgsl?raw";
import fragWGSL from "./shader/wireframe.frag.wgsl?raw";
import { GeometryBase } from "../GeometryBase";
import { Box } from "./Box";
import { Sphere } from "./Sphere";

export type Renderable = Box | Sphere;

export class RenderableObject extends GeometryBase {
  protected _modelMatrix: Mat4 = mat4.identity(); // 模型矩阵
  protected vertices: Float32Array = new Float32Array();
  protected indices: Uint16Array = new Uint16Array();
  protected renderBuffer: { vertex: GPUBuffer; index: GPUBuffer };
  protected vertexBuffer: GPUBuffer | undefined;
  protected _wireframe: boolean = false;
  protected wireframeIndexBuffer: GPUBuffer | undefined;
  protected wireframeIndices: Uint16Array | undefined;
  protected wireframeVertexCount: number | undefined;
  protected wireframePipeline: GPURenderPipeline | undefined;
  private device: GPUDevice;

  constructor() {
    super();
    const gpuManager = GPUManager.getInstance();
    const device = gpuManager.device as GPUDevice;
    this.device = device;
    this.renderBuffer = {
      vertex: CreateGPUBufferF32(this.vertices),
      index: CreateGPUBufferUint16(this.indices),
    };
  }

  public get modelMatrix(): Mat4 {
    return this._modelMatrix;
  }

  public get wireframe() {
    return this._wireframe;
  }

  public set wireframe(value: boolean) {
    this._wireframe = value;
    if (value) {
      const gpuManager = GPUManager.getInstance();
      const device = gpuManager.device as GPUDevice;
      const format = gpuManager.format as GPUTextureFormat;

      this.wireframeVertexCount = this.wireframeIndices!.length;
      this.vertexBuffer = CreateGPUBufferF32(this.vertices);
      this.wireframeIndexBuffer = CreateGPUBufferUint16(this.wireframeIndices!);

      this.wireframePipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
          module: device.createShaderModule({
            code: vertWGSL,
          }),
          entryPoint: "main",
          buffers: [
            {
              arrayStride: 8 * 4,
              attributes: [
                {
                  shaderLocation: 0,
                  offset: 0,
                  format: "float32x3",
                },
                // normal
                {
                  shaderLocation: 1,
                  offset: 3 * 4,
                  format: "float32x3",
                },
                // uv
                {
                  shaderLocation: 2,
                  offset: 6 * 4,
                  format: "float32x2",
                },
              ],
            },
          ],
        },
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
        layout: this.wireframePipeline.getBindGroupLayout(0),
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
  }

  public render = (renderPass: GPURenderPassEncoder, index: number) => {
    renderPass.setVertexBuffer(0, this.renderBuffer.vertex);
    renderPass.setIndexBuffer(this.renderBuffer.index, "uint16");
    renderPass.drawIndexed(this.indices.length, 1, 0, 0, index);
  };

  public renderShadow = (shadowPass: GPURenderPassEncoder, index: number) => {
    shadowPass.setVertexBuffer(0, this.renderBuffer.vertex);
    shadowPass.setIndexBuffer(this.renderBuffer.index, "uint16");
    shadowPass.drawIndexed(this.indices.length, 1, 0, 0, index);
  };

  public renderWireframe(renderPass: GPURenderPassEncoder, camera: Camera) {
    const vpMatrix = mat4.multiply(camera.projectionMatrix, camera.viewMatrix);
    const mvpMatrix = mat4.multiply(vpMatrix, this.modelMatrix) as Float32Array;
    this.device.queue.writeBuffer(this.uniformBuffer, 0, mvpMatrix);
    renderPass.setPipeline(this.wireframePipeline!);
    renderPass.setBindGroup(0, this.uniformBindGroup);
    renderPass.setVertexBuffer(0, this.vertexBuffer!);
    renderPass.setIndexBuffer(this.wireframeIndexBuffer!, "uint16");
    renderPass.drawIndexed(this.wireframeVertexCount!, 1);
  }
}
