import Stats from "stats.js";
import { BaseLight } from "../light/BaseLight";
import { RenderableObject } from "../shape/RenderableObject";
import { Camera } from "./Camera";
import { GPUManager } from "./GPUManager";

enum LightType {
  DIRECTIONAL,
  POINT,
  SPOT,
}

export class Scene {
  private stats: Stats | undefined;
  private objects: RenderableObject[] = []; // 保存场景中的所有对象
  private device: GPUDevice;
  private context: GPUCanvasContext;
  private format: GPUTextureFormat;

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
    const size = { width: canvas.width, height: canvas.height };

    this.sampleCount = gpuManager.sampleCount;

    this.depthTexture = this.device.createTexture({
      size,
      sampleCount: this.sampleCount > 1 ? this.sampleCount : undefined,
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    const texture = this.device.createTexture({
      size: [canvas.width, canvas.height],
      sampleCount: this.sampleCount > 1 ? this.sampleCount : undefined,
      format: this.format,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    this.view = texture.createView();
  }

  addObject(object: RenderableObject) {
    this.objects.push(object);
  }

  addLight(light: BaseLight) {
    let lightsOfType = this.lights.get(light.type);
    if (!lightsOfType) {
      lightsOfType = [];
      this.lights.set(light.type, lightsOfType);
    }
    lightsOfType.push(light);
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
}
