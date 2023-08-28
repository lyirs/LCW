import { GPUManager } from "../core/GPUManager";

export const createComputePipeline = async (
  label: string,
  layouts: GPUBindGroupLayout[],
  shader: string
): Promise<GPUComputePipeline> => {
  const gpuManager = GPUManager.getInstance();
  const device = gpuManager.device as GPUDevice;
  return device.createComputePipelineAsync({
    label: `${label}`,
    layout: device.createPipelineLayout({
      label: `${label}`,
      bindGroupLayouts: layouts,
    }),
    compute: {
      module: device.createShaderModule({
        label: `${label}`,
        code: shader,
      }),
      entryPoint: "main",
    },
  });
};

export const runComputePassEncoder = (
  commandEncoder: GPUCommandEncoder,
  pipeline: GPUComputePipeline,
  bindGroups: GPUBindGroup[],
  workgroupCountX: number,
  workgroupCountY?: number,
  workgroupCountZ?: number
) => {
  const computePassEncoder = commandEncoder.beginComputePass();
  computePassEncoder.setPipeline(pipeline);
  for (let i = 0; i < bindGroups.length; i++) {
    computePassEncoder.setBindGroup(i, bindGroups[i]);
  }
  computePassEncoder.dispatchWorkgroups(
    workgroupCountX,
    workgroupCountY,
    workgroupCountZ
  );
  computePassEncoder.end();
};
