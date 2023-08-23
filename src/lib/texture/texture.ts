export const createTextureFromImage = async (
  device: GPUDevice,
  imageSrc: string,
  magFilter: GPUFilterMode = "linear",
  minFilter: GPUFilterMode = "linear",
  addressModeU: GPUAddressMode = "repeat",
  addressModeV: GPUAddressMode = "repeat"
) => {
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

export const createTextureFromCanvas = async (
  device: GPUDevice,
  canvas: HTMLCanvasElement,
  magFilter: GPUFilterMode = "linear",
  minFilter: GPUFilterMode = "linear",
  addressModeU: GPUAddressMode = "repeat",
  addressModeV: GPUAddressMode = "repeat"
) => {
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
