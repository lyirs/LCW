import Stats from "stats.js";
import { LightType } from "../helper/light";
import { BaseLight } from "../light/BaseLight";
import { BaseGeometry } from "../shape/BaseGeometry";
import { Camera } from "./Camera";
import { GPUManager } from "./GPUManager";

export class Scene {
  private stats: Stats | undefined;
  private objects: BaseGeometry[] = []; // 保存场景中的所有对象
  private device: GPUDevice;
  private context: GPUCanvasContext;
  private format: GPUTextureFormat;
  private texture: GPUTexture;
  private depthTexture: GPUTexture; // 记录深度贴图
  private view: GPUTextureView; // 记录视图

  private sampleCount: number;

  private lights: Map<LightType, BaseLight[]> = new Map();

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
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    this.texture = this.device.createTexture({
      size: [canvas.width, canvas.height],
      sampleCount: this.sampleCount > 1 ? this.sampleCount : undefined,
      format: this.format,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    this.view = this.texture.createView();
  }

  addObject(object: BaseGeometry) {
    this.objects.push(object);
  }

  addLight(light: BaseLight) {
    let lightsOfType = this.lights.get(light.type);
    if (!lightsOfType) {
      lightsOfType = [];
      this.lights.set(light.type, lightsOfType);
    }
    lightsOfType.push(light);
    for (let i = 0; i < this.objects.length; i++) {
      this.objects[i].setLightBuffer(this.lights);
    }
  }

  render(camera: Camera) {
    if (this.stats) {
      this.stats.begin();
    }
    const commandEncoder = this.device.createCommandEncoder();

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view:
            this.sampleCount > 1
              ? this.view
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
    });

    this.objects.forEach((object) => {
      if (object.render) {
        object.render(renderPass, camera);
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
    this.view = this.texture.createView();
    this.depthTexture.destroy();
    this.depthTexture = this.device.createTexture({
      size: [canvas.width, canvas.height],
      sampleCount: this.sampleCount > 1 ? this.sampleCount : undefined,
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    camera.aspect = canvas.width / canvas.height;
  }
}
