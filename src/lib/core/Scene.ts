import Stats from "stats.js";
import { vec3, mat4 } from "wgpu-matrix";
import {
  CreateBindGroupWithLayout,
  CreateFragmentBindGroupLayout,
  CreateVertexBindGroupLayout,
} from "../auxiliary/bindGroup";
import {
  CreateStorageBuffer,
  CreateUniformBuffer,
} from "../auxiliary/gpuBuffer";
import {
  getLightViewProjectionMatrix,
  Light,
  lightBindGroupEntries,
  LightConfigs,
  LightType,
} from "../auxiliary/light";
import {
  CreateRenderPassDescriptor,
  CreateRenderPipeLineWithLayout,
  CreateShadowRenderPassDescriptor,
  CreateShadowRenderPipeLineWithLayout,
  setPipelineVertexBuffer,
} from "../auxiliary/renderProgram";
import { GeometryBase } from "../objects/GeometryBase";
import { Camera } from "./Camera";
import { GPUManager } from "./GPUManager";
import vertWGSL from "./shader/base.vert.wgsl?raw";
import fragWGSL from "./shader/base.frag.wgsl?raw";
import { Axes } from "../objects/HelperObjects/Axes";
import {
  CreateDepthTexture,
  CreateShadowTexture,
  CreateTexture,
} from "../auxiliary/texture";
import { DirectionalLight } from "../light/DirectionalLight";
import { AmbientLight } from "../light/AmbientLight";
import { PointLight } from "../light/PointLight";
import { Vector3 } from "../math/Vector3";
import { Renderable } from "../objects/RenderableObject/RenderableBase";
import { CreateRenderBundle } from "../auxiliary/renderBundle";

export class Scene {
  private stats: Stats | undefined; // 性能数据显示
  private device: GPUDevice;
  //
  private texture: GPUTexture; // 贴图
  private renderDepthTexture: GPUTexture; // 深度贴图
  // 场景物体
  public objects: Map<string, Renderable[]> = new Map();
  public helperObjects: GeometryBase[] = []; // 场景辅助物体
  private uniformBuffer: GPUBuffer; // vp buffer
  private modelMatrixBuffer: GPUBuffer | undefined; // 场景模型buffer
  private normalMatrixBuffer: GPUBuffer | undefined; // 场景法线buffer
  private vsBindGroupLayout: GPUBindGroupLayout;
  private vsBindGroup: GPUBindGroup | undefined;
  // 光源
  public lights: Map<LightType, Light[]> = new Map(); // 光线
  public ambientLights: AmbientLight[] | undefined;
  public pointLights: PointLight[] | undefined;
  public directionalLights: DirectionalLight[] | undefined;
  private lightBindGroupEntries: any; //
  private lightBindGroupLayout: GPUBindGroupLayout | null = null;
  private lightBindGroup: GPUBindGroup | undefined;
  // 阴影
  private lightViewProjectionBuffer: GPUBuffer; // 直射光vp buffer
  private shadowTexture: GPUTexture;
  private shadowBindGroup: GPUBindGroup | undefined;
  // 渲染管线
  private pipeline: GPURenderPipeline;
  private shadowPipeline: GPURenderPipeline;
  // 命令束
  private renderBundle: GPURenderBundle | undefined;

  constructor() {
    const gpuManager = GPUManager.getInstance();
    this.device = gpuManager.device as GPUDevice;
    const canvas = gpuManager.canvas as HTMLCanvasElement;
    // const size = {
    //   width: canvas.width,
    //   height: canvas.height,
    //   depthOrArrayLayers: 1,
    // };
    const size = [canvas.width, canvas.height, 1]; // 这里的单位为texel（纹素）
    // bindGroupLayout
    this.vsBindGroupLayout = CreateVertexBindGroupLayout([
      "uniform", // @group(0) @binding(0) var<uniform> uniforms : Uniforms
      "uniform", // @group(0) @binding(1) var<uniform> lightProjection : mat4x4<f32>
      "read-only-storage", // @group(0) @binding(2) var<storage> model : array<mat4x4<f32>>
      "read-only-storage", // @group(0) @binding(3) var<storage> normal : array<mat4x4<f32>>
    ]);
    this.lightBindGroupLayout = CreateFragmentBindGroupLayout([
      "uniform", // @group(1) @binding(0) var<uniform> ambientLight : array<vec4<f32>, 2>
      "uniform", // @group(1) @binding(1) var<uniform> pointLight : array<vec4<f32>, 2>
      "uniform", // @group(1) @binding(2) var<uniform> directionLight : array<vec4<f32>, 2>
      "depth", // @group(1) @binding(3) var shadowMap: texture_depth_2d;
      "comparison", // @group(1) @binding(4) var shadowSampler: sampler_comparison;
    ]);

    // 创建阴影管线
    const pipelineBuffer = setPipelineVertexBuffer(
      ["float32x3", "float32x3", "float32x2"],
      [0, 3 * 4, 6 * 4]
    );
    this.shadowPipeline = CreateShadowRenderPipeLineWithLayout(
      "shadow",
      [this.vsBindGroupLayout],
      vertWGSL,
      pipelineBuffer
    );

    // 创建渲染管线
    this.pipeline = CreateRenderPipeLineWithLayout(
      "pipeline",
      [this.vsBindGroupLayout, this.lightBindGroupLayout!],
      vertWGSL,
      fragWGSL,
      pipelineBuffer
    );

    // 贴图
    this.texture = CreateTexture(size);
    // 深度贴图
    this.renderDepthTexture = CreateDepthTexture(size);
    // 阴影贴图
    this.shadowTexture = CreateShadowTexture(2048, 2048);

    // light buffer
    this.lightViewProjectionBuffer = CreateUniformBuffer(4 * 4 * 4); // vp矩阵
    // uniform buffer
    this.uniformBuffer = CreateUniformBuffer(4 * 4 * 4 * 2); // 4*4*4 viewMatrix ; 4*4*4 projectionMatrix

    // 全局更新
    this.updateGlobalBindGroup();

    // bindgroup @group(1)
    this.lightBindGroupEntries = lightBindGroupEntries(this.shadowTexture);
    this.lightBindGroup = this.device.createBindGroup({
      layout: this.lightBindGroupLayout!,
      entries: this.lightBindGroupEntries,
    });
  }

  public updateGlobalBindGroup(count: number = 1) {
    // 全局矩阵
    this.modelMatrixBuffer = CreateStorageBuffer(4 * 4 * 4 * count);
    this.normalMatrixBuffer = CreateStorageBuffer(4 * 4 * 4 * count);

    // bindgroup @group(0)
    this.vsBindGroup = CreateBindGroupWithLayout(this.vsBindGroupLayout, [
      { binding: 0, resource: this.uniformBuffer },
      { binding: 1, resource: this.lightViewProjectionBuffer },
      { binding: 2, resource: this.modelMatrixBuffer },
      { binding: 3, resource: this.normalMatrixBuffer },
    ]);

    this.shadowBindGroup = CreateBindGroupWithLayout(this.vsBindGroupLayout, [
      { binding: 0, resource: this.uniformBuffer },
      { binding: 1, resource: this.lightViewProjectionBuffer },
      { binding: 2, resource: this.modelMatrixBuffer },
      { binding: 3, resource: this.normalMatrixBuffer },
    ]);
  }

  public addObject(object: Renderable | Axes) {
    if (!this.helperObjects.includes(object) && object instanceof Axes) {
      this.helperObjects.push(object);
    } else if (!(object instanceof Axes)) {
      const objectType = object.constructor.name;
      if (!this.objects.has(objectType)) {
        this.objects.set(objectType, []);
      }
      const objectsOfType = this.objects.get(objectType);
      if (objectsOfType && !objectsOfType.includes(object)) {
        objectsOfType.push(object);
      }
    }
  }

  public getTotalRenderableCount(): number {
    let count = 0;
    for (const [type, objects] of this.objects.entries()) {
      count += objects.length;
    }
    return count;
  }

  public prepareResources() {
    if (this.getTotalRenderableCount() > 0) {
      // 全局矩阵
      this.updateGlobalBindGroup(this.getTotalRenderableCount());
    }
    this.setLightBuffer(this.lights);
  }

  public addLight(light: Light) {
    let lightsOfType = this.lights.get(light.type);
    if (!lightsOfType) {
      lightsOfType = [];
      this.lights.set(light.type, lightsOfType);
    }
    lightsOfType.push(light);
  }

  private handleLightBuffer(
    lightType: LightType,
    lights: Light[],
    isUpdate = false
  ): void {
    // TODO 多光源阴影
    const config = LightConfigs[lightType];
    if (!lights || !lights.length) return;
    const lightsArray = new Float32Array(config.size * lights.length);
    for (let i = 0; i < lights.length; i++) {
      lightsArray.set(lights[i].array, i * config.size);
    }
    if (isUpdate) {
      this.device.queue.writeBuffer(
        this.lightBindGroupEntries[lightType].resource.buffer,
        0,
        lightsArray
      );
    } else {
      config.buffer = CreateUniformBuffer(lights.length * config.size * 4);
      this.lightBindGroupEntries[lightType].resource.buffer = config.buffer;
      this.device.queue.writeBuffer(config.buffer, 0, lightsArray);
    }
    if (lightType === LightType.DIRECTIONAL) {
      // 光线视图投影矩阵的更新
      this.device.queue.writeBuffer(
        this.lightViewProjectionBuffer,
        0,
        getLightViewProjectionMatrix(
          new Vector3(lightsArray[0], lightsArray[1], lightsArray[2])
        )
      );
    }
  }
  public setLightBuffer(lights: Map<LightType, Light[]>): void {
    for (const lightType of Object.values(LightType) as LightType[]) {
      this.handleLightBuffer(lightType, lights.get(lightType) as Light[]);
    }
    this.lightBindGroup = this.device.createBindGroup({
      layout: this.lightBindGroupLayout!,
      entries: this.lightBindGroupEntries,
    });
  }

  private updateLightBuffer() {
    for (const lightType of Object.values(LightType) as LightType[]) {
      this.handleLightBuffer(
        lightType,
        this.lights.get(lightType) as Light[],
        true
      );
    }
  }

  private createRenderBundle() {
    this.renderBundle = CreateRenderBundle(
      this.pipeline,
      this.vsBindGroup!,
      this.lightBindGroup!,
      this.objects
    );
  }

  render(camera: Camera) {
    if (this.stats) {
      this.stats.begin();
    }
    const modelMatrixArray = new Float32Array(
      4 * 4 * this.getTotalRenderableCount()
    );
    const normalMatrixArray = new Float32Array(
      4 * 4 * this.getTotalRenderableCount()
    );

    let globalIndex = 0; // 用于跟踪全局索引
    for (const objectsOfType of this.objects.values()) {
      for (const object of objectsOfType) {
        modelMatrixArray.set(object.modelMatrix, globalIndex * 4 * 4);
        let normalMatrix = mat4.copy(object.modelMatrix);
        normalMatrix = mat4.invert(normalMatrix);
        normalMatrix = mat4.transpose(normalMatrix) as Float32Array;
        normalMatrixArray.set(normalMatrix, globalIndex * 4 * 4);
        globalIndex++;
      }
    }

    this.updateLightBuffer();
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
    this.device.queue.writeBuffer(this.modelMatrixBuffer!, 0, modelMatrixArray);
    this.device.queue.writeBuffer(
      this.normalMatrixBuffer!,
      0,
      normalMatrixArray
    );
    //
    const commandEncoder = this.device.createCommandEncoder();

    // 阴影渲染
    const shadowPass = commandEncoder.beginRenderPass(
      CreateShadowRenderPassDescriptor(this.shadowTexture)
    );
    shadowPass.setPipeline(this.shadowPipeline);
    shadowPass.setBindGroup(0, this.shadowBindGroup!);

    globalIndex = 0;
    for (const [type, objectsOfType] of this.objects.entries()) {
      for (const object of objectsOfType) {
        if (object.castShadow) {
          object.render(shadowPass, globalIndex);
        }
        globalIndex++;
      }
    }
    shadowPass.end();

    // 主渲染
    const renderPassDescriptor = CreateRenderPassDescriptor(
      this.texture,
      this.renderDepthTexture
    );
    const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);

    if (this.renderBundle) {
      renderPass.executeBundles([this.renderBundle]);
    } else {
      this.createRenderBundle();
      renderPass.executeBundles([this.renderBundle!]);
    }

    // 其他附件
    this.helperObjects.forEach((object) => {
      (object as Axes).render(renderPass, camera);
    });

    globalIndex = 0;
    for (const [type, objectsOfType] of this.objects.entries()) {
      for (const object of objectsOfType) {
        if (object.wireframe) {
          object.renderWireframe(renderPass, camera);
          globalIndex++;
        }
      }
    }

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
    const canvas = gpuManager.canvas as HTMLCanvasElement;
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    const size = [canvas.width, canvas.height, 1];
    this.texture.destroy();
    this.texture = CreateTexture(size);
    // 深度贴图
    this.renderDepthTexture.destroy();
    this.renderDepthTexture = CreateDepthTexture(size);
    camera.aspect = canvas.width / canvas.height;
  }
}
