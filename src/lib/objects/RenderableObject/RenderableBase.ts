import { mat4, Mat4, vec3 } from "wgpu-matrix";
import { Camera } from "../../core/Camera";
import { GPUManager } from "../../core/GPUManager";
import {
  CreateBindGroupLayout,
  CreateBindGroupWithLayout,
} from "../../helper/bindGroup";
import {
  CreateGPUBufferF32,
  CreateGPUBufferUint16,
  CreateUniformBUffer,
} from "../../helper/gpuBuffer";
import { lightBindGroupEntries, LightType } from "../../helper/light";
import {
  createRenderPipeLineWithLayout,
  setPipelineVertexBuffer,
} from "../../helper/renderProgram";
import { AmbientLight } from "../../light/AmbientLight";
import { BaseLight } from "../../light/BaseLight";
import { DirectionalLight } from "../../light/DirectionalLight";
import { PointLight } from "../../light/PointLight";
import { Vector3 } from "../../math/Vector3";
import { GeometryBase } from "../GeometryBase";
import vertWGSL from "./shader/base.vert.wgsl?raw";
import fragWGSL from "./shader/base.frag.wgsl?raw";

export class RenderableObject extends GeometryBase {
  public device: GPUDevice;
  public pipeline: GPURenderPipeline;
  public vertexBuffer: GPUBuffer;
  public indexBuffer: GPUBuffer;
  public vertexCount: number;
  public lightBindGroup: any;
  protected _vsBindGroupLayout: any;
  protected _lightBindGroupLayout: any;
  public position: Vector3 = new Vector3(0, 0, 0);
  public scale: Vector3 = new Vector3(1, 1, 1);
  public rotation: Vector3 = new Vector3(0, 0, 0);
  protected _modelMatrix: Mat4 = mat4.identity();
  protected _lightBindGroupEntries: any;
  public directionalLights: BaseLight[] | undefined;
  public directionalBuffer: any;
  public ambientLights: BaseLight[] | undefined;
  public ambientBuffer: any;
  public pointLights: BaseLight[] | undefined;
  public pointBuffer: any;

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
    ]);

    this._lightBindGroupLayout = CreateBindGroupLayout(device, [
      GPUShaderStage.FRAGMENT,
      GPUShaderStage.FRAGMENT,
      GPUShaderStage.FRAGMENT,
    ]);

    const pipelineBuffer = setPipelineVertexBuffer(
      ["float32x3", "float32x3", "float32x2"],
      [0, 3 * 4, 6 * 4]
    );

    this.pipeline = createRenderPipeLineWithLayout(
      "pipeline",
      [this._vsBindGroupLayout, this._lightBindGroupLayout],
      vertWGSL,
      fragWGSL,
      pipelineBuffer
    );

    this.uniformBuffer = CreateUniformBUffer(this.device, 4 * 4 * 4 * 4);

    this.uniformBindGroup = CreateBindGroupWithLayout(
      this.device,
      this._vsBindGroupLayout,
      [{ binding: 0, resource: this.uniformBuffer }]
    );

    this._lightBindGroupEntries = lightBindGroupEntries(this.device);
  }

  public get modelMatrix(): Mat4 {
    return this._modelMatrix;
  }

  public setLightBuffer(lights: Map<LightType, BaseLight[]>): void {
    {
      this.ambientLights = lights.get(LightType.AMBIENT);
      if (this.ambientLights) {
        this.ambientBuffer = CreateUniformBUffer(
          this.device,
          this.ambientLights.length * 8 * 4 // size12 pad; f32 intensity; vec3 color; size4 pad
        );
        this._lightBindGroupEntries[0].resource.buffer = this.ambientBuffer;
        const lightsArray = new Float32Array(8 * this.ambientLights.length);
        for (let i = 0; i < this.ambientLights.length; i++) {
          lightsArray.set((this.ambientLights[i] as AmbientLight).array, i * 8);
        }
        this.device.queue.writeBuffer(this.ambientBuffer, 0, lightsArray);
      }
    }
    {
      this.pointLights = lights.get(LightType.POINT);
      console.log(this.pointLights);
      if (this.pointLights) {
        this.pointBuffer = CreateUniformBUffer(
          this.device,
          this.pointLights.length * 8 * 4 // size12 pad; f32 intensity; vec3 color; size4 pad
        );
        this._lightBindGroupEntries[1].resource.buffer = this.pointBuffer;
        const lightsArray = new Float32Array(8 * this.pointLights.length);
        for (let i = 0; i < this.pointLights.length; i++) {
          lightsArray.set((this.pointLights[i] as PointLight).array, i * 8);
        }
        this.device.queue.writeBuffer(this.pointBuffer, 0, lightsArray);
      }
    }
    {
      this.directionalLights = lights.get(LightType.DIRECTIONAL);
      if (this.directionalLights) {
        this.directionalBuffer = CreateUniformBUffer(
          this.device,
          this.directionalLights.length * 8 * 4 // vec3 direction; f32 intensity; vec3 color; size4 pad
        );
        this._lightBindGroupEntries[2].resource.buffer = this.directionalBuffer;
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
      layout: this._lightBindGroupLayout, // @group(1)
      entries: this._lightBindGroupEntries,
    });
  }

  private updateLightBuffer() {
    if (this.ambientLights) {
      const lightsArray = new Float32Array(8 * this.ambientLights.length);
      for (let i = 0; i < this.ambientLights.length; i++) {
        lightsArray.set((this.ambientLights[i] as AmbientLight).array, i * 8);
      }
      this.device.queue.writeBuffer(this.ambientBuffer, 0, lightsArray);
    }
    if (this.pointLights) {
      const lightsArray = new Float32Array(8 * this.pointLights.length);
      for (let i = 0; i < this.pointLights.length; i++) {
        lightsArray.set((this.pointLights[i] as PointLight).array, i * 8);
      }
      this.device.queue.writeBuffer(this.pointBuffer, 0, lightsArray);
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

    this.updateLightBuffer();

    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, this.uniformBindGroup);
    renderPass.setBindGroup(1, this.lightBindGroup);
    renderPass.setVertexBuffer(0, this.vertexBuffer);
    renderPass.setIndexBuffer(this.indexBuffer, "uint16");
    renderPass.drawIndexed(this.vertexCount);
  }
}
