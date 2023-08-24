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
import { BaseLight } from "../light/BaseLight";
import { DirectionalLight } from "../light/DirectionalLight";
import { lightBindGroupEntries, LightType } from "../helper/light";
import {
  CreateBindGroupLayout,
  CreateBindGroupWithLayout,
} from "../helper/bindGroup";
import {
  createRenderPipeLineWithLayout,
  setPipelineVertexBuffer,
} from "../helper/renderProgram";

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
  public lightBindGroup: any;
  private vsBindGroupLayout: any;
  private lightBindGroupLayout: any;
  public vertexBuffer: GPUBuffer;
  public indexBuffer: GPUBuffer;
  public vertexCount: number;
  public device: GPUDevice;
  private vertices: Float32Array;
  private indices: Uint16Array;
  public width: number;
  public height: number;
  public depth: number;
  private lightBindGroupEntries: any;
  public directionalLights: BaseLight[] | undefined;
  public directionalBuffer: any;
  public ambientLights: BaseLight[] | undefined;
  public ambientBuffer: any;

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

    this.vsBindGroupLayout = CreateBindGroupLayout(device, [
      GPUShaderStage.VERTEX,
    ]);

    this.lightBindGroupLayout = CreateBindGroupLayout(device, [
      GPUShaderStage.FRAGMENT,
      GPUShaderStage.FRAGMENT,
      GPUShaderStage.FRAGMENT,
    ]);

    const pipelineBuffer = setPipelineVertexBuffer(
      ["float32x3", "float32x3", "float32x2"],
      [boxPositionOffset, boxNormalOffset, boxUvOffset]
    );

    this.pipeline = createRenderPipeLineWithLayout(
      "boxPipeline",
      [this.vsBindGroupLayout, this.lightBindGroupLayout],
      vertWGSL,
      fragWGSL,
      pipelineBuffer
    );

    this.uniformBuffer = CreateUniformBUffer(this.device, 4 * 4 * 4 * 2);

    this.uniformBindGroup = CreateBindGroupWithLayout(
      this.device,
      this.vsBindGroupLayout,
      [{ binding: 0, resource: this.uniformBuffer }]
    );

    this.lightBindGroupEntries = lightBindGroupEntries(this.device);
  }

  public setLightBuffer(lights: Map<LightType, BaseLight[]>): void {
    {
      this.ambientLights = lights.get(LightType.AMBIENT);
      if (this.ambientLights) {
        this.ambientBuffer = CreateUniformBUffer(
          this.device,
          this.ambientLights.length * 8 * 4 // vec3 position; f32 intensity; vec3 direction; size4 pad
        );
        this.lightBindGroupEntries[0].resource.buffer = this.ambientBuffer;
        const lightsArray = new Float32Array(8 * this.ambientLights.length);
        for (let i = 0; i < this.ambientLights.length; i++) {
          lightsArray.set(
            (this.ambientLights[i] as DirectionalLight).array,
            i * 8
          );
        }
        this.device.queue.writeBuffer(this.ambientBuffer, 0, lightsArray);
      }
    }
    {
      this.directionalLights = lights.get(LightType.DIRECTIONAL);
      if (this.directionalLights) {
        this.directionalBuffer = CreateUniformBUffer(
          this.device,
          this.directionalLights.length * 8 * 4 // vec3 position; f32 intensity; vec3 direction; size4 pad
        );
        this.lightBindGroupEntries[2].resource.buffer = this.directionalBuffer;
        const lightsArray = new Float32Array(8 * this.directionalLights.length);
        for (let i = 0; i < this.directionalLights.length; i++) {
          lightsArray.set(
            (this.directionalLights[i] as DirectionalLight).array,
            i * 8
          );
        }
        this.device.queue.writeBuffer(this.directionalBuffer, 0, lightsArray);
      }
    }

    this.lightBindGroup = this.device.createBindGroup({
      layout: this.lightBindGroupLayout, // @group(1)
      entries: this.lightBindGroupEntries,
    });
  }

  private updateLightBuffer() {
    if (this.ambientLights) {
      const lightsArray = new Float32Array(8 * this.ambientLights.length);
      for (let i = 0; i < this.ambientLights.length; i++) {
        lightsArray.set(
          (this.ambientLights[i] as DirectionalLight).array,
          i * 8
        );
      }
      this.device.queue.writeBuffer(this.ambientBuffer, 0, lightsArray);
    }
    if (this.directionalLights) {
      const lightsArray = new Float32Array(8 * this.directionalLights.length);
      for (let i = 0; i < this.directionalLights.length; i++) {
        lightsArray.set(
          (this.directionalLights[i] as DirectionalLight).array,
          i * 8
        );
      }
      this.device.queue.writeBuffer(this.directionalBuffer, 0, lightsArray);
    }
  }

  public render(renderPass: GPURenderPassEncoder, camera: Camera) {
    const vpMatrix = mat4.multiply(camera.projectionMatrix, camera.viewMatrix);
    const mvpMatrix = mat4.multiply(vpMatrix, this.modelMatrix) as Float32Array;
    this.device.queue.writeBuffer(this.uniformBuffer, 0, mvpMatrix);

    let normalMatrix = mat4.copy(this.modelMatrix);
    normalMatrix = mat4.invert(normalMatrix);
    normalMatrix = mat4.transpose(normalMatrix) as Float32Array;
    this.device.queue.writeBuffer(this.uniformBuffer, 4 * 4 * 4, normalMatrix);

    this.updateLightBuffer();

    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, this.uniformBindGroup);
    renderPass.setBindGroup(1, this.lightBindGroup);
    renderPass.setVertexBuffer(0, this.vertexBuffer);
    renderPass.setIndexBuffer(this.indexBuffer, "uint16");
    renderPass.drawIndexed(this.vertexCount);
  }
}
