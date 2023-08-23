import { GPUManager } from "../core/GPUManager";

const gpuManager = GPUManager.getInstance();
const device = gpuManager.device as GPUDevice;
const format = gpuManager.format as GPUTextureFormat;

export const setVertexBuffer = (formats: string[]) => {
  const len = formats.length;
  const buffers = [];
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
  return buffers;
};

export const createRenderPipeLine = (
  label: string,
  vsShader: string,
  fsShader: string,
  buffers: []
) => {
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
      topology: "line-list",
    },
    // 深度
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: "less",
      format: "depth24plus",
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
