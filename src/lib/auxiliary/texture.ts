import { GPUManager } from "../core/GPUManager";

export const CreateTextureFromImage = async (
  imageSrc: string,
  magFilter: GPUFilterMode = "linear",
  minFilter: GPUFilterMode = "linear",
  addressModeU: GPUAddressMode = "repeat",
  addressModeV: GPUAddressMode = "repeat"
) => {
  const gpuManager = GPUManager.getInstance();
  const device = gpuManager.device as GPUDevice;
  const image = new Image();
  image.src = imageSrc;
  await image.decode();
  const bitmap = await createImageBitmap(image);

  const texture: GPUTexture = device.createTexture({
    size: [bitmap.width, bitmap.height, 1],
    format: "rgba8unorm",
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });
  device.queue.copyExternalImageToTexture(
    { source: bitmap },
    { texture: texture },
    [bitmap.width, bitmap.height]
  );

  const sampler = device.createSampler({
    magFilter: magFilter,
    minFilter: minFilter,
    addressModeU: addressModeU,
    addressModeV: addressModeV,
  });

  return { texture, sampler };
};

export const CreateTextureFromCanvas = async (
  canvas: HTMLCanvasElement,
  magFilter: GPUFilterMode = "linear",
  minFilter: GPUFilterMode = "linear",
  addressModeU: GPUAddressMode = "repeat",
  addressModeV: GPUAddressMode = "repeat"
) => {
  const gpuManager = GPUManager.getInstance();
  const device = gpuManager.device as GPUDevice;
  const texture: GPUTexture = device.createTexture({
    size: { width: canvas.width, height: canvas.height },
    format: "rgba8unorm",
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });
  device.queue.copyExternalImageToTexture(
    { source: canvas, flipY: true },
    { texture: texture },
    [canvas.width, canvas.height]
  );

  const sampler = device.createSampler({
    magFilter: magFilter,
    minFilter: minFilter,
    addressModeU: addressModeU,
    addressModeV: addressModeV,
  });

  return { texture, sampler };
};

export const CreateShadowTexture = (
  width: number = 2048,
  height: number = 2048,
  depth: number = 1
) => {
  const gpuManager = GPUManager.getInstance();
  const device = gpuManager.device as GPUDevice;
  return device.createTexture({
    size: [width, height, depth], // 阴影贴图大小
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING, // TEXTURE_BINDING 纹理可以绑定在group用作着色器中的采样纹理
    format: "depth32float",
  });
};

export const CreateTexture = (size = [1024, 1024, 1]): GPUTexture => {
  const gpuManager = GPUManager.getInstance();
  const device = gpuManager.device as GPUDevice;
  const format = gpuManager.format as GPUTextureFormat;
  const sampleCount = gpuManager.sampleCount;
  return device.createTexture({
    size: size,
    sampleCount: sampleCount > 1 ? sampleCount : undefined,
    format: format,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });
};

export const CreateDepthTexture = (size = [1024, 1024, 1]): GPUTexture => {
  const gpuManager = GPUManager.getInstance();
  const device = gpuManager.device as GPUDevice;
  const sampleCount = gpuManager.sampleCount;
  return device.createTexture({
    size,
    sampleCount: sampleCount > 1 ? sampleCount : undefined,
    format: "depth32float",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });
};
