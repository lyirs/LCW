import { CreateUniformBUffer } from "./gpuBuffer";

export const lightBindGroupEntries = (device: GPUDevice) => {
  const defaultBuffer = CreateUniformBUffer(device, 8 * 4);
  return [
    {
      binding: 0,
      resource: {
        buffer: defaultBuffer, // 默认缓冲区
      },
    },
    {
      binding: 1,
      resource: {
        buffer: defaultBuffer, // 默认缓冲区
      },
    },
    {
      binding: 2,
      resource: {
        buffer: defaultBuffer, // 默认缓冲区
      },
    },
  ];
};

export enum LightType {
  AMBIENT,
  DIRECTIONAL,
  POINT,
  SPOT,
}
