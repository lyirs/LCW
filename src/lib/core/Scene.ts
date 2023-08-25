import Stats from "stats.js";
import { vec3, mat4 } from "wgpu-matrix";
import {
  CreateBindGroup,
  CreateBindGroupLayout,
  CreateBindGroupWithLayout,
} from "../helper/bindGroup";
import { CreateGPUBufferF32, CreateUniformBUffer } from "../helper/gpuBuffer";
import { lightBindGroupEntries, LightType } from "../helper/light";
import {
  createRenderPipeLineWithLayout,
  setPipelineVertexBuffer,
} from "../helper/renderProgram";
import { AmbientLight } from "../light/AmbientLight";
import { BaseLight } from "../light/BaseLight";
import { DirectionalLight } from "../light/DirectionalLight";
import { PointLight } from "../light/PointLight";
import { GeometryBase } from "../objects/GeometryBase";
import { Camera } from "./Camera";
import { GPUManager } from "./GPUManager";
import vertWGSL from "./shader/base.vert.wgsl?raw";
import fragWGSL from "./shader/base.frag.wgsl?raw";
import { Box } from "../objects/RenderableObject/Box";
import { Sphere } from "../objects/RenderableObject/Sphere";

export class Scene {
  private stats: Stats | undefined;
  private device: GPUDevice;
  private context: GPUCanvasContext;
  private format: GPUTextureFormat;
  private texture: GPUTexture;
  private renderDepthTexture: GPUTexture; // 记录深度贴图

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
  vsBindGroupLayout: GPUBindGroupLayout;
  uniformBuffer: GPUBuffer;
  vertexBuffer: any;
  shadowPipeline: GPURenderPipeline;
  pipeline: GPURenderPipeline;
  modelMatrix: GPUBuffer;
  uniformBindGroup: any;
  shadowBindGroup: any;
  boxBuffer: { vertex: GPUBuffer; index: GPUBuffer };
  sphereBuffer: { vertex: GPUBuffer; index: GPUBuffer };
  boxCount: number = 0;
  sphereCount: number = 0;
  normalMatrix: GPUBuffer;

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

    const pipelineBuffer = setPipelineVertexBuffer(
      ["float32x3", "float32x3", "float32x2"],
      [0, 3 * 4, 6 * 4]
    );

    this.vsBindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0, // @group(0) @binding(0) var<uniform> uniforms : Uniforms
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: "uniform" },
        },
        {
          binding: 1, // @group(0) @binding(1) var<uniform> lightProjection : mat4x4<f32>
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: "uniform" },
        },
        {
          binding: 2, // @group(0) @binding(2) var<storage> model : array<mat4x4<f32>>
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: "read-only-storage" },
        },
        {
          binding: 3, // @group(0) @binding(3) var<storage> normal : array<mat4x4<f32>>
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: "read-only-storage" },
        },
      ],
    });

    // 创建阴影管线
    this.shadowPipeline = this.device.createRenderPipeline({
      label: "shadow",
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [this.vsBindGroupLayout],
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

    // 创建阴影贴图
    this.shadowDepthView = this.device
      .createTexture({
        size: [2048, 2048], // 阴影贴图大小
        usage:
          GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING, // TEXTURE_BINDING 纹理可以绑定在group用作着色器中的采样纹理
        format: "depth32float",
      })
      .createView();

    // 创建渲染管线
    this.lightBindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0, // @group(1) @binding(0) var<uniform> ambientLight : array<vec4<f32>, 2>
          visibility: GPUShaderStage.FRAGMENT,
          buffer: { type: "uniform" },
        },
        {
          binding: 1, // @group(1) @binding(1) var<uniform> pointLight : array<vec4<f32>, 2>
          visibility: GPUShaderStage.FRAGMENT,
          buffer: { type: "uniform" },
        },
        {
          binding: 2, // @group(1) @binding(2) var<uniform> directionLight : array<vec4<f32>, 2>
          visibility: GPUShaderStage.FRAGMENT,
          buffer: { type: "uniform" },
        },
        {
          binding: 3, // @group(1) @binding(3) var shadowMap: texture_depth_2d;
          visibility: GPUShaderStage.FRAGMENT,
          texture: { sampleType: "depth" },
        },
        {
          binding: 4, // @group(1) @binding(4) var shadowSampler: sampler_comparison;
          visibility: GPUShaderStage.FRAGMENT,
          sampler: { type: "comparison" },
        },
      ],
    });

    this.pipeline = createRenderPipeLineWithLayout(
      "pipeline",
      [this.vsBindGroupLayout, this.lightBindGroupLayout!],
      vertWGSL,
      fragWGSL,
      pipelineBuffer
    );

    // 深度贴图
    this.sampleCount = gpuManager.sampleCount;
    this.renderDepthTexture = this.device.createTexture({
      size,
      sampleCount: this.sampleCount > 1 ? this.sampleCount : undefined,
      format: "depth32float",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    // 物体buffer
    this.boxBuffer = {
      vertex: this.device.createBuffer({
        label: "GPUBuffer store vertex",
        size: Box.vertex.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      }),
      index: this.device.createBuffer({
        label: "GPUBuffer store vertex index",
        size: Box.index.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      }),
    };

    this.sphereBuffer = {
      vertex: this.device.createBuffer({
        label: "GPUBuffer store vertex",
        size: Sphere.vertex.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      }),
      index: this.device.createBuffer({
        label: "GPUBuffer store vertex index",
        size: Sphere.index.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      }),
    };

    this.device.queue.writeBuffer(this.boxBuffer.vertex, 0, Box.vertex);
    this.device.queue.writeBuffer(this.boxBuffer.index, 0, Box.index);
    this.device.queue.writeBuffer(this.sphereBuffer.vertex, 0, Sphere.vertex);
    this.device.queue.writeBuffer(this.sphereBuffer.index, 0, Sphere.index);

    // 全局矩阵
    this.modelMatrix = this.device.createBuffer({
      label: "GPUBuffer store n*4x4 matrix",
      size: 4 * 4 * 4, // 4 x 4 x float32 x NUM
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    this.normalMatrix = this.device.createBuffer({
      label: "GPUBuffer store n*4x4 matrix",
      size: 4 * 4 * 4, // 4 x 4 x float32 x NUM
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    //

    this.texture = this.device.createTexture({
      size: [canvas.width, canvas.height],
      sampleCount: this.sampleCount > 1 ? this.sampleCount : undefined,
      format: this.format,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    this.uniformBuffer = CreateUniformBUffer(this.device, 4 * 4 * 4 * 2);

    // 光照
    this.lightProjectionBuffer = CreateUniformBUffer(this.device, 4 * 4 * 4);
    this.lightBindGroupEntries = lightBindGroupEntries(this.device);

    // 阴影
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

    // bindgroup

    this.uniformBindGroup = CreateBindGroupWithLayout(
      this.device,
      this.vsBindGroupLayout,
      [
        { binding: 0, resource: this.uniformBuffer },
        { binding: 1, resource: this.lightProjectionBuffer },
        { binding: 2, resource: this.modelMatrix },
        { binding: 3, resource: this.normalMatrix },
      ]
    );

    this.shadowBindGroup = CreateBindGroupWithLayout(
      this.device,
      this.vsBindGroupLayout,
      [
        { binding: 0, resource: this.uniformBuffer },
        { binding: 1, resource: this.lightProjectionBuffer },
        { binding: 2, resource: this.modelMatrix },
        { binding: 3, resource: this.normalMatrix },
      ]
    );

    this.lightBindGroup = this.device.createBindGroup({
      layout: this.lightBindGroupLayout!, // @group(1)
      entries: this.lightBindGroupEntries,
    });
  }

  addObject(object: Box | Sphere) {
    if (!this.objects.includes(object)) {
      this.objects.push(object);

      if (object instanceof Box) {
        this.boxCount++;
      }
      if (object instanceof Sphere) {
        this.sphereCount++;
      }

      // 全局矩阵
      this.modelMatrix = this.device.createBuffer({
        label: "GPUBuffer store n*4x4 matrix",
        size: 4 * 4 * 4 * this.objects.length, // 4 x 4 x float32 x NUM
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      this.normalMatrix = this.device.createBuffer({
        label: "GPUBuffer store n*4x4 matrix",
        size: 4 * 4 * 4 * this.objects.length, // 4 x 4 x float32 x NUM
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });

      this.uniformBindGroup = CreateBindGroupWithLayout(
        this.device,
        this.vsBindGroupLayout,
        [
          { binding: 0, resource: this.uniformBuffer },
          { binding: 1, resource: this.lightProjectionBuffer },
          { binding: 2, resource: this.modelMatrix },
          { binding: 3, resource: this.normalMatrix },
        ]
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
        // 光线视图投影矩阵
        {
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
      // 光线视图投影矩阵
      {
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
  }

  render(camera: Camera) {
    if (this.stats) {
      this.stats.begin();
    }
    const modelMatrixArray = new Float32Array(4 * 4 * this.objects.length);
    const normalMatrixArray = new Float32Array(4 * 4 * this.objects.length);
    this.objects.forEach((object, index) => {
      if (object.castShadow) {
        modelMatrixArray.set(object.modelMatrix, index * 4 * 4);

        let normalMatrix = mat4.copy(object.modelMatrix);
        normalMatrix = mat4.invert(normalMatrix);
        normalMatrix = mat4.transpose(normalMatrix) as Float32Array;
        normalMatrixArray.set(normalMatrix, index * 4 * 4);
      }
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
    this.device.queue.writeBuffer(this.modelMatrix, 0, modelMatrixArray);
    this.device.queue.writeBuffer(this.normalMatrix, 0, normalMatrixArray);

    //

    const commandEncoder = this.device.createCommandEncoder();

    // 阴影渲染
    const shadowPass = commandEncoder.beginRenderPass({
      colorAttachments: [],
      depthStencilAttachment: {
        view: this.shadowDepthView,
        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      },
    });

    shadowPass.setPipeline(this.shadowPipeline);
    shadowPass.setBindGroup(0, this.shadowBindGroup);

    this.objects.forEach((object, index) => {
      if (object.castShadow) {
        if (object instanceof Box) {
          // set box vertex
          shadowPass.setVertexBuffer(0, this.boxBuffer.vertex);
          shadowPass.setIndexBuffer(this.boxBuffer.index, "uint16");
          shadowPass.drawIndexed(Box.index.length, 1, 0, 0, index);
        }
        if (object instanceof Sphere) {
          // set sphere vertex
          shadowPass.setVertexBuffer(0, this.sphereBuffer.vertex);
          shadowPass.setIndexBuffer(this.sphereBuffer.index, "uint16");
          shadowPass.drawIndexed(Sphere.index.length, 1, 0, 0, index);
        }
      }
    });

    shadowPass.end();

    // 主渲染
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
        view: this.renderDepthTexture.createView(),
        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      },
    } as GPURenderPassDescriptor;

    const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);

    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, this.uniformBindGroup);
    renderPass.setBindGroup(1, this.lightBindGroup!);

    this.objects.forEach((object, index) => {
      if (object.castShadow) {
        if (object instanceof Box) {
          // set box vertex
          renderPass.setVertexBuffer(0, this.boxBuffer.vertex);
          renderPass.setIndexBuffer(this.boxBuffer.index, "uint16");
          renderPass.drawIndexed(Box.index.length, 1, 0, 0, index);
        }
        if (object instanceof Sphere) {
          // set sphere vertex
          renderPass.setVertexBuffer(0, this.sphereBuffer.vertex);
          renderPass.setIndexBuffer(this.sphereBuffer.index, "uint16");
          renderPass.drawIndexed(Sphere.index.length, 1, 0, 0, index);
        }
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
    this.renderDepthTexture.destroy();
    this.renderDepthTexture = this.device.createTexture({
      size: [canvas.width, canvas.height],
      sampleCount: this.sampleCount > 1 ? this.sampleCount : undefined,
      format: "depth32float",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    camera.aspect = canvas.width / canvas.height;
  }
}
