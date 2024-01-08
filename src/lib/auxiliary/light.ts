import { GPUManager } from "../core/GPUManager";
import { AmbientLight } from "../light/AmbientLight";
import { DirectionalLight } from "../light/DirectionalLight";
import { PointLight } from "../light/PointLight";
import { Matrix4 } from "../math/Matrix4";
import { Vector3 } from "../math/Vector3";
import { CreateUniformBuffer } from "./gpuBuffer";

export enum LightType {
  AMBIENT,
  POINT,
  DIRECTIONAL,
  // SPOT,
}

type LightConfig = {
  size: number;
  buffer: GPUBuffer | null;
};

export const LightConfigs: Record<LightType, LightConfig> = {
  [LightType.AMBIENT]: { size: 8, buffer: null },
  [LightType.POINT]: { size: 8, buffer: null },
  [LightType.DIRECTIONAL]: { size: 8, buffer: null },
};

export type Light = AmbientLight | PointLight | DirectionalLight;

export const lightBindGroupEntries = (shadowTexture: GPUTexture) => {
  const gpuManager = GPUManager.getInstance();
  const device = gpuManager.device as GPUDevice;
  const defaultBuffer = CreateUniformBuffer(8 * 4);
  const lessSampler = device.createSampler({ compare: "less" });
  return [
    {
      binding: 0, // 环境光
      resource: {
        buffer: defaultBuffer,
      },
    },
    {
      binding: 1, // 点光源
      resource: {
        buffer: defaultBuffer,
      },
    },
    {
      binding: 2, // 直射光
      resource: {
        buffer: defaultBuffer,
      },
    },
    {
      binding: 3, // 阴影贴图
      resource: shadowTexture.createView(),
    },
    {
      binding: 4, // 对比采样
      resource: lessSampler,
    },
  ];
};

export const getLightViewProjectionMatrix = (
  lightPos: Vector3
): Float32Array => {
  const lightPosition = new Vector3(lightPos.x, lightPos.y, lightPos.z);
  const lightViewMatrix = Matrix4.lookAt(
    lightPosition,
    new Vector3(0, 0, 0),
    new Vector3(0, 1, 0)
  );
  let lightProjectionMatrix = Matrix4.ortho(-40, 40, -40, 40, -50, 200);
  lightProjectionMatrix = Matrix4.multiply(
    lightProjectionMatrix,
    lightViewMatrix
  );
  return lightProjectionMatrix as Float32Array;
};
