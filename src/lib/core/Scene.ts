import Stats from "stats.js";
import { vec3, mat4 } from "wgpu-matrix";
import { CreateUniformBUffer } from "../helper/gpuBuffer";
import { lightBindGroupEntries, LightType } from "../helper/light";
import { AmbientLight } from "../light/AmbientLight";
import { BaseLight } from "../light/BaseLight";
import { DirectionalLight } from "../light/DirectionalLight";
import { PointLight } from "../light/PointLight";
import { GeometryBase } from "../objects/GeometryBase";
import { RenderableObject } from "../objects/RenderableObject/RenderableBase";
import { Camera } from "./Camera";
import { GPUManager } from "./GPUManager";

export class Scene {
  private stats: Stats | undefined;
  private device: GPUDevice;
  private context: GPUCanvasContext;
  private format: GPUTextureFormat;
  private texture: GPUTexture;
  private depthTexture: GPUTexture; // 记录深度贴图

  private sampleCount: number;

  private objects: GeometryBase[] = []; //
  private lights: Map<LightType, BaseLight[]> = new Map();
  ambientLights: BaseLight[] | undefined;
  ambientBuffer: GPUBuffer | undefined;
  lightBindGroupEntries: any;
  pointLights: BaseLight[] | undefined;
  pointBuffer: GPUBuffer | undefined;
  directionalLights: BaseLight[] | undefined;
  directionalBuffer: GPUBuffer | undefined;
  lightBindGroup: GPUBindGroup | undefined;
  lightBindGroupLayout: GPUBindGroupLayout | null = null;
  lightProjectionBuffer: GPUBuffer;
  shadowDepthView: GPUTextureView;
  lessSampler: GPUSampler;

  constructor() {
    const gpuManager = GPUManager.getInstance();
    this.device = gpuManager.device as GPUDevice;
    this.context = gpuManager.context as GPUCanvasContext;
    this.format = gpuManager.format as GPUTextureFormat;

    const canvas = gpuManager.canvas as HTMLCanvasElement;
    // const size = {
    //   width: canvas.width,
    //   height: canvas.height,
    //   depthOrArrayLayers: 1,
    // };
    const size = [canvas.width, canvas.height, 1]; // 这里的单位为texel（纹素）
    this.sampleCount = gpuManager.sampleCount;

    this.depthTexture = this.device.createTexture({
      size,
      sampleCount: this.sampleCount > 1 ? this.sampleCount : undefined,
      format: "depth32float",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    this.texture = this.device.createTexture({
      size: [canvas.width, canvas.height],
      sampleCount: this.sampleCount > 1 ? this.sampleCount : undefined,
      format: this.format,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    // 光照
    this.lightProjectionBuffer = CreateUniformBUffer(this.device, 4 * 4 * 4);

    this.lightBindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: { type: "uniform" },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: { type: "uniform" },
        },
        {
          binding: 2,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: { type: "uniform" },
        },
        {
          binding: 3,
          visibility: GPUShaderStage.FRAGMENT,
          texture: { sampleType: "depth" },
        },
        {
          binding: 4,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: { type: "comparison" },
        },
      ],
    });

    this.lightBindGroupEntries = lightBindGroupEntries(this.device);

    // 阴影
    this.shadowDepthView = this.device
      .createTexture({
        size: [2048, 2048], // 阴影贴图大小
        usage:
          GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING, // TEXTURE_BINDING 纹理可以绑定在group用作着色器中的采样纹理
        format: "depth32float",
      })
      .createView();

    this.lessSampler = this.device.createSampler({ compare: "less" });

    this.lightBindGroupEntries.push(
      {
        binding: 3,
        resource: this.shadowDepthView,
      },
      {
        binding: 4,
        resource: this.lessSampler,
      }
    );
  }

  addObject(object: GeometryBase) {
    if (!this.objects.includes(object)) {
      this.objects.push(object);
      (object as unknown as RenderableObject).setPipeline(
        this.lightBindGroupLayout!,
        this.lightProjectionBuffer
      );
    }
  }

  addLight(light: BaseLight) {
    let lightsOfType = this.lights.get(light.type);
    if (!lightsOfType) {
      lightsOfType = [];
      this.lights.set(light.type, lightsOfType);
    }
    lightsOfType.push(light);

    this.setLightBuffer(this.lights);
  }

  public setLightBuffer(lights: Map<LightType, BaseLight[]>): void {
    {
      this.ambientLights = lights.get(LightType.AMBIENT);
      if (this.ambientLights) {
        this.ambientBuffer = CreateUniformBUffer(
          this.device,
          this.ambientLights.length * 8 * 4 // size12 pad; f32 intensity; vec3 color; size4 pad
        );
        this.lightBindGroupEntries[0].resource.buffer = this.ambientBuffer;
        const lightsArray = new Float32Array(8 * this.ambientLights.length);
        for (let i = 0; i < this.ambientLights.length; i++) {
          lightsArray.set((this.ambientLights[i] as AmbientLight).array, i * 8);
        }
        this.device.queue.writeBuffer(this.ambientBuffer, 0, lightsArray);
      }
    }
    {
      this.pointLights = lights.get(LightType.POINT);
      if (this.pointLights) {
        this.pointBuffer = CreateUniformBUffer(
          this.device,
          this.pointLights.length * 8 * 4 // size12 pad; f32 intensity; vec3 color; size4 pad
        );
        this.lightBindGroupEntries[1].resource.buffer = this.pointBuffer;
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
      layout: this.lightBindGroupLayout!, // @group(1)
      entries: this.lightBindGroupEntries,
    });
  }

  private updateLightBuffer() {
    // TODO 处理多光源
    if (this.ambientLights) {
      const lightsArray = new Float32Array(8 * this.ambientLights.length);
      for (let i = 0; i < this.ambientLights.length; i++) {
        lightsArray.set((this.ambientLights[i] as AmbientLight).array, i * 8);
      }
      this.device.queue.writeBuffer(
        this.ambientBuffer as GPUBuffer,
        0,
        lightsArray
      );
    }
    if (this.pointLights) {
      const lightsArray = new Float32Array(8 * this.pointLights.length);
      for (let i = 0; i < this.pointLights.length; i++) {
        lightsArray.set((this.pointLights[i] as PointLight).array, i * 8);
      }
      this.device.queue.writeBuffer(
        this.pointBuffer as GPUBuffer,
        0,
        lightsArray
      );
    }
    if (this.directionalLights) {
      const lightsArray = new Float32Array(8 * this.directionalLights.length);
      for (let i = 0; i < this.directionalLights.length; i++) {
        lightsArray.set(
          (this.directionalLights[i] as DirectionalLight).array,
          i * 8
        );
      }
      this.device.queue.writeBuffer(
        this.directionalBuffer as GPUBuffer,
        0,
        lightsArray
      );
      const lightPosition = vec3.fromValues(
        lightsArray[0],
        lightsArray[1],
        lightsArray[2]
      );
      const lightViewMatrix = mat4.identity();
      mat4.lookAt(
        lightPosition,
        vec3.fromValues(0, 0, 0),
        vec3.fromValues(0, 1, 0),
        lightViewMatrix
      );
      const lightProjectionMatrix = mat4.identity();
      mat4.ortho(-40, 40, -40, 40, -50, 200, lightProjectionMatrix);
      mat4.multiply(
        lightProjectionMatrix,
        lightViewMatrix,
        lightProjectionMatrix
      );
      this.device.queue.writeBuffer(
        this.lightProjectionBuffer,
        0,
        lightProjectionMatrix as Float32Array
      );
    }
  }

  render(camera: Camera) {
    if (this.stats) {
      this.stats.begin();
    }
    const commandEncoder = this.device.createCommandEncoder();

    this.objects.forEach((object) => {
      if (object.castShadow) {
        object.renderShadow(commandEncoder, this.shadowDepthView);
      }
    });

    const renderPassDescriptor = {
      colorAttachments: [
        {
          view:
            this.sampleCount > 1
              ? this.texture.createView()
              : this.context.getCurrentTexture().createView(),
          resolveTarget:
            this.sampleCount > 1
              ? this.context.getCurrentTexture().createView()
              : undefined,
          clearValue: { r: 0, g: 0, b: 0, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
      depthStencilAttachment: {
        view: this.depthTexture.createView(),
        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      },
    } as GPURenderPassDescriptor;

    const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);

    this.updateLightBuffer();

    this.objects.forEach((object) => {
      if (object.render) {
        object.render(renderPass, camera, this.lightBindGroup as GPUBindGroup);
      }
    });

    renderPass.end();

    this.device.queue.submit([commandEncoder.finish()]);
    if (this.stats) {
      this.stats.end();
    }
  }

  public setStats(mode: number = 0) {
    const stats = new Stats();
    stats.showPanel(mode);
    document.body.appendChild(stats.dom);
    this.stats = stats;
  }

  public resize(camera: Camera) {
    const gpuManager = GPUManager.getInstance();
    let canvas = gpuManager.canvas as HTMLCanvasElement;
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    this.texture.destroy();
    this.texture = this.device.createTexture({
      size: [canvas.width, canvas.height],
      sampleCount: this.sampleCount > 1 ? this.sampleCount : undefined,
      format: this.format,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.depthTexture.destroy();
    this.depthTexture = this.device.createTexture({
      size: [canvas.width, canvas.height],
      sampleCount: this.sampleCount > 1 ? this.sampleCount : undefined,
      format: "depth32float",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    camera.aspect = canvas.width / canvas.height;
  }
}
