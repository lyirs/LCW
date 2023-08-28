import { GPUManager } from "../core/GPUManager";

export const setPipelineVertexBuffer = (
  formats: string[],
  offsets: number[] = []
) => {
  const len = formats.length;
  const offsetLen = offsets.length;
  let buffers = [];
  if (offsetLen === 0) {
    for (let i = 0; i < len; i++) {
      const stride = 4 * parseInt(formats[i].split("x")[1]);
      buffers.push({
        arrayStride: stride,
        attributes: [
          {
            shaderLocation: i,
            format: formats[i],
            offset: 0,
          },
        ],
      });
    }
  } else {
    let attributes = [];
    let strides = 0;
    for (let i = 0; i < offsetLen; i++) {
      strides += 4 * parseInt(formats[i].split("x")[1]);
      attributes.push({
        shaderLocation: i,
        format: formats[i],
        offset: offsets[i],
      });
    }
    buffers = [
      {
        arrayStride: strides,
        attributes: attributes as Iterable<GPUVertexAttribute>,
      },
    ];
  }

  return buffers as Iterable<GPUVertexBufferLayout | null>;
};

export const createRenderPipeLine = (
  label: string,
  vsShader: string,
  fsShader: string,
  buffers: Iterable<GPUVertexBufferLayout | null>
) => {
  const gpuManager = GPUManager.getInstance();
  const device = gpuManager.device as GPUDevice;
  const format = gpuManager.format as GPUTextureFormat;
  return device.createRenderPipeline({
    label: label,
    layout: "auto",
    // 顶点着色器
    vertex: {
      module: device.createShaderModule({
        code: vsShader,
      }),
      entryPoint: "main",
      buffers: buffers,
    },
    // 片元着色器
    fragment: {
      module: device.createShaderModule({
        code: fsShader,
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
      topology: "triangle-list",
      cullMode: "back",
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
            count: gpuManager.sampleCount,
          }
        : undefined,
  });
};

export const CreateRenderPipeLineWithLayout = (
  label: string,
  layout: GPUBindGroupLayout[],
  vsShader: string,
  fsShader: string,
  buffers: Iterable<GPUVertexBufferLayout | null>
) => {
  const gpuManager = GPUManager.getInstance();
  const device = gpuManager.device as GPUDevice;
  const format = gpuManager.format as GPUTextureFormat;
  return device.createRenderPipeline({
    label: label,
    layout: device.createPipelineLayout({
      bindGroupLayouts: layout,
    }),
    // 顶点着色器
    vertex: {
      module: device.createShaderModule({
        code: vsShader,
      }),
      entryPoint: "main",
      buffers: buffers,
    },
    // 片元着色器
    fragment: {
      module: device.createShaderModule({
        code: fsShader,
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
      topology: "triangle-list",
      cullMode: "back",
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
            count: gpuManager.sampleCount,
          }
        : undefined,
  });
};

export const CreateShadowRenderPipeLineWithLayout = (
  label: string,
  layout: GPUBindGroupLayout[],
  vsShader: string,
  buffers: Iterable<GPUVertexBufferLayout | null>
) => {
  const gpuManager = GPUManager.getInstance();
  const device = gpuManager.device as GPUDevice;
  return device.createRenderPipeline({
    label: label,
    layout: device.createPipelineLayout({
      bindGroupLayouts: layout,
    }),
    // 顶点着色器
    vertex: {
      module: device.createShaderModule({
        code: vsShader,
      }),
      entryPoint: "shadow",
      buffers: buffers,
    },
    // 图元类型
    primitive: {
      topology: "triangle-list",
      cullMode: "back",
    },
    // 深度
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: "less",
      format: "depth32float",
    },
  });
};

export const CreateShadowRenderPassDescriptor = (
  shadowTexture: GPUTexture
): GPURenderPassDescriptor => {
  return {
    colorAttachments: [],
    depthStencilAttachment: {
      view: shadowTexture.createView(),
      depthClearValue: 1.0,
      depthLoadOp: "clear",
      depthStoreOp: "store",
    },
  };
};

export const CreateRenderPassDescriptor = (
  texture: GPUTexture,
  renderDepthTexture: GPUTexture
): GPURenderPassDescriptor => {
  const gpuManager = GPUManager.getInstance();
  const sampleCount = gpuManager.sampleCount;
  const context = gpuManager.context as GPUCanvasContext;

  return {
    colorAttachments: [
      {
        view:
          sampleCount > 1
            ? texture.createView()
            : context.getCurrentTexture().createView(),
        resolveTarget:
          sampleCount > 1
            ? context.getCurrentTexture().createView()
            : undefined,
        clearValue: { r: 0, g: 0, b: 0, a: 1.0 },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
    depthStencilAttachment: {
      view: renderDepthTexture.createView(),
      depthClearValue: 1.0,
      depthLoadOp: "clear",
      depthStoreOp: "store",
    },
  };
};
