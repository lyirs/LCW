import Stats from "stats.js";
import { vec3, mat4 } from "wgpu-matrix";
import {
  CreateBindGroupWithLayout,
  CreateFragmentBindGroupLayout,
  CreateVertexBindGroupLayout,
} from "../helper/bindGroup";
import { CreateStorageBuffer, CreateUniformBuffer } from "../helper/gpuBuffer";
import {
  getLightViewProjectionMatrix,
  Light,
  lightBindGroupEntries,
  LightConfigs,
  LightType,
} from "../helper/light";
import {
  CreateRenderPassDescriptor,
  CreateRenderPipeLineWithLayout,
  CreateShadowRenderPassDescriptor,
  CreateShadowRenderPipeLineWithLayout,
  setPipelineVertexBuffer,
} from "../helper/renderProgram";
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
} from "../texture/texture";
import { DirectionalLight } from "../light/DirectionalLight";
import { AmbientLight } from "../light/AmbientLight";
import { PointLight } from "../light/PointLight";
import { Vector3 } from "../math/Vector3";
import {
  Renderable,
  RenderableObject,
} from "../objects/RenderableObject/RenderableBase";

export class Scene {
  private stats: Stats | undefined; // 性能数据显示
  private device: GPUDevice;
  //
  private texture: GPUTexture; // 贴图
  private renderDepthTexture: GPUTexture; // 深度贴图
  // 场景物体
  public objects: GeometryBase[] = []; // 场景物体
  public helperObjects: GeometryBase[] = []; // 场景辅助物体
  private uniformBuffer: GPUBuffer; // vp buffer
  private modelMatrixBuffer: GPUBuffer; // 场景模型buffer
  private normalMatrixBuffer: GPUBuffer; // 场景法线buffer
  private vsBindGroupLayout: GPUBindGroupLayout;
  private vsBindGroup: GPUBindGroup;
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
  private shadowBindGroup: GPUBindGroup;
  // 渲染管线
  private pipeline: GPURenderPipeline;
  private shadowPipeline: GPURenderPipeline;

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

    // 全局矩阵
    this.modelMatrixBuffer = CreateStorageBuffer(4 * 4 * 4);
    this.normalMatrixBuffer = CreateStorageBuffer(4 * 4 * 4);

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

    // bindgroup @group(1)
    this.lightBindGroupEntries = lightBindGroupEntries(this.shadowTexture);
    this.lightBindGroup = this.device.createBindGroup({
      layout: this.lightBindGroupLayout!,
      entries: this.lightBindGroupEntries,
    });
  }

  public addObject(object: Renderable | Axes) {
    if (!this.helperObjects.includes(object) && object instanceof Axes) {
      this.helperObjects.push(object);
      return;
    }
    if (!this.objects.includes(object)) {
      this.objects.push(object);
      // 全局矩阵
      this.modelMatrixBuffer = CreateStorageBuffer(
        4 * 4 * 4 * this.objects.length
      );
      this.normalMatrixBuffer = CreateStorageBuffer(
        4 * 4 * 4 * this.objects.length
      );
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
  }

  public addLight(light: Light) {
    let lightsOfType = this.lights.get(light.type);
    if (!lightsOfType) {
      lightsOfType = [];
      this.lights.set(light.type, lightsOfType);
    }
    lightsOfType.push(light);
    this.setLightBuffer(this.lights);
  }

  private handleLightBuffer(lightType: LightType, lights: Light[]): void {
    // TODO 多光源阴影
    const config = LightConfigs[lightType];
    if (!lights || !lights.length) return;

    config.buffer = CreateUniformBuffer(lights.length * config.size * 4);
    this.lightBindGroupEntries[lightType].resource.buffer = config.buffer;
    const lightsArray = new Float32Array(config.size * lights.length);
    for (let i = 0; i < lights.length; i++) {
      lightsArray.set(lights[i].array, i * config.size);
    }
    this.device.queue.writeBuffer(config.buffer, 0, lightsArray);

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
    this.setLightBuffer(this.lights);
  }

  render(camera: Camera) {
    if (this.stats) {
      this.stats.begin();
    }
    const modelMatrixArray = new Float32Array(4 * 4 * this.objects.length);
    const normalMatrixArray = new Float32Array(4 * 4 * this.objects.length);
    this.objects.forEach((object, index) => {
      modelMatrixArray.set(object.modelMatrix, index * 4 * 4);
      let normalMatrix = mat4.copy(object.modelMatrix);
      normalMatrix = mat4.invert(normalMatrix);
      normalMatrix = mat4.transpose(normalMatrix) as Float32Array;
      normalMatrixArray.set(normalMatrix, index * 4 * 4);
    });
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
    this.device.queue.writeBuffer(this.modelMatrixBuffer, 0, modelMatrixArray);
    this.device.queue.writeBuffer(
      this.normalMatrixBuffer,
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
    shadowPass.setBindGroup(0, this.shadowBindGroup);
    this.objects.forEach((object, index) => {
      if (object.castShadow && object instanceof RenderableObject) {
        object.render(shadowPass, index);
      }
    });
    shadowPass.end();

    // 主渲染
    const renderPassDescriptor = CreateRenderPassDescriptor(
      this.texture,
      this.renderDepthTexture
    );
    const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);
    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, this.vsBindGroup);
    renderPass.setBindGroup(1, this.lightBindGroup!);
    this.objects.forEach((object, index) => {
      if (object instanceof RenderableObject) {
        object.render(renderPass, index);
      }
    });

    // 其他附件
    this.helperObjects.forEach((object) => {
      (object as Axes).render(renderPass, camera);
    });
    this.objects.forEach((object) => {
      if (object instanceof RenderableObject && object.wireframe) {
        object.renderWireframe(renderPass, camera);
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
