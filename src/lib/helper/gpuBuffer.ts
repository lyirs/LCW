// 创建顶点缓冲区 VBO
// 获取一块状态为映射了的显存，以及一个对应的 arrayBuffer 对象来写数据

import { GPUManager } from "../core/GPUManager";

/**
 * 应用程序可以请求映射一个 GPUBuffer，这样它们就可以通过代表 GPUBuffer 分配的部分的 arraybuffer 访问它的内容。
 * 映射一个 GPUBuffer 是通过 mapAsync() 异步请求的，这样用户代理可以确保 GPU 在应用程序访问它的内容之前完成了对 GPUBuffer 的使用。
 * 映射的 GPUBuffer 不能被 GPU 使用，必须使用 unmap() 解除映射，然后才能将使用它的工作提交到 Queue 时间轴。
 * 一旦映射了 GPUBuffer，应用程序就可以通过 getMappedRange 同步请求访问其内容的范围
 */
export const CreateGPUBufferF32 = (
  data: Float32Array,
  usageFlag: GPUBufferUsageFlags = GPUBufferUsage.VERTEX |
    GPUBufferUsage.COPY_DST
): GPUBuffer => {
  const gpuManager = GPUManager.getInstance();
  const device = gpuManager.device as GPUDevice;
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage: usageFlag,
    mappedAtCreation: true,
  });
  new Float32Array(buffer.getMappedRange()).set(data);
  buffer.unmap();
  return buffer;
};

export const CreateGPUBufferUint32 = (
  data: Uint32Array,
  usageFlag: GPUBufferUsageFlags = GPUBufferUsage.INDEX |
    GPUBufferUsage.COPY_DST
): GPUBuffer => {
  const gpuManager = GPUManager.getInstance();
  const device = gpuManager.device as GPUDevice;
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage: usageFlag,
    mappedAtCreation: true,
  });
  new Uint32Array(buffer.getMappedRange()).set(data);
  buffer.unmap();
  return buffer;
};

export const CreateGPUBufferUint16 = (
  data: Uint16Array,
  usageFlag: GPUBufferUsageFlags = GPUBufferUsage.INDEX |
    GPUBufferUsage.COPY_DST
): GPUBuffer => {
  const gpuManager = GPUManager.getInstance();
  const device = gpuManager.device as GPUDevice;
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage: usageFlag,
    mappedAtCreation: true,
  });
  new Uint16Array(buffer.getMappedRange()).set(data);
  buffer.unmap();
  return buffer;
};

export const CreateUniformBuffer = (size: number): GPUBuffer => {
  const gpuManager = GPUManager.getInstance();
  const device = gpuManager.device as GPUDevice;
  return device.createBuffer({
    size: size,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
};

export const CreateStorageBuffer = (size: number): GPUBuffer => {
  const gpuManager = GPUManager.getInstance();
  const device = gpuManager.device as GPUDevice;
  return device.createBuffer({
    size: size,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
};

export const readBufferData = async (buffer: GPUBuffer, byteLength: number) => {
  const gpuManager = GPUManager.getInstance();
  const device = gpuManager.device as GPUDevice;
  const readBuffer = device.createBuffer({
    size: byteLength,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });
  const encoder = device.createCommandEncoder();
  encoder.copyBufferToBuffer(buffer, 0, readBuffer, 0, byteLength);
  device.queue.submit([encoder.finish()]);
  await readBuffer.mapAsync(GPUMapMode.READ);
  return readBuffer.getMappedRange();
};
