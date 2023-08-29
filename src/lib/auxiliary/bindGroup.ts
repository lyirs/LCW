import { GPUManager } from "../core/GPUManager";

type BindGroupBufferEntry = {
  binding: GPUIndex32;
  resource: GPUBuffer;
  offset?: GPUSize64;
  size?: GPUSize64;
};

type BindGroupEntrys = {
  binding: GPUIndex32;
  resource: GPUSampler | GPUTextureView | GPUBufferBinding | GPUExternalTexture;
};

type BindGroupEntry = BindGroupBufferEntry | BindGroupEntrys;

type ResourceType =
  | "uniform"
  | "storage"
  | "read-only-storage"
  | "depth"
  | "float"
  | "comparison";

const RESOURCE_MAP: Record<ResourceType, any> = {
  uniform: { buffer: { type: "uniform" } },
  storage: { buffer: { type: "storage" } },
  "read-only-storage": { buffer: { type: "read-only-storage" } },
  depth: { texture: { sampleType: "depth" } },
  float: { texture: { sampleType: "float" } },
  comparison: { sampler: { type: "comparison" } },
};

function createBindGroupLayout(
  types: ResourceType[],
  visibility: GPUShaderStageFlags
): GPUBindGroupLayout {
  const gpuManager = GPUManager.getInstance();
  const device = gpuManager.device as GPUDevice;

  const entries = types.map((type: ResourceType, index) => ({
    binding: index,
    visibility: visibility,
    ...RESOURCE_MAP[type],
  }));

  return device.createBindGroupLayout({ entries });
}

export const CreateVertexBindGroupLayout = (
  types: ResourceType[]
): GPUBindGroupLayout => {
  return createBindGroupLayout(types, GPUShaderStage.VERTEX);
};

export const CreateFragmentBindGroupLayout = (
  types: ResourceType[]
): GPUBindGroupLayout => {
  return createBindGroupLayout(types, GPUShaderStage.FRAGMENT);
};

// device.createBindGroupLayout({
//   entries: [
//     {
//       binding: 0,
//       visibility: GPUShaderStage.VERTEX,
//       buffer: {
//         type: "uniform",
//       },
//     },
//   ],
// });

export const CreateBindGroup = (
  pipeline: GPURenderPipeline | GPUComputePipeline,
  bindGroupLayoutIndex: number,
  entries: BindGroupEntry[]
): GPUBindGroup => {
  const gpuManager = GPUManager.getInstance();
  const device = gpuManager.device as GPUDevice;
  return device.createBindGroup({
    layout: pipeline.getBindGroupLayout(bindGroupLayoutIndex),
    entries: entries.map((entry) => {
      let bindResource: GPUBindingResource;

      if (entry.resource instanceof GPUBuffer) {
        bindResource = {
          buffer: entry.resource,
          offset: (entry as BindGroupBufferEntry).offset,
          size: (entry as BindGroupBufferEntry).size,
        };
      } else {
        bindResource = entry.resource;
      }

      return {
        binding: entry.binding,
        resource: bindResource,
      };
    }),
  });
};

export const CreateBindGroupWithLayout = (
  layout: GPUBindGroupLayout,
  entries: BindGroupEntry[]
): GPUBindGroup => {
  const gpuManager = GPUManager.getInstance();
  const device = gpuManager.device as GPUDevice;
  return device.createBindGroup({
    layout: layout,
    entries: entries.map((entry) => {
      let bindResource: GPUBindingResource;

      if (entry.resource instanceof GPUBuffer) {
        bindResource = {
          buffer: entry.resource,
          offset: (entry as BindGroupBufferEntry).offset,
          size: (entry as BindGroupBufferEntry).size,
        };
      } else {
        bindResource = entry.resource;
      }

      return {
        binding: entry.binding,
        resource: bindResource,
      };
    }),
  });
};

/*
const group = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0), 
    entries: [
      {
        binding: 0,
        resource: {
          buffer: buffer,
        },
      },
      {
        binding: 1,
        resource: textview
      },
      {
        binding: 2,
        resource: sampler
      },
    ],
  })
  */
