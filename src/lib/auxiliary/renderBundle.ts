import { GPUManager } from "../core/GPUManager";
import { Cube } from "../objects/RenderableObject/Box";
import { Renderable } from "../objects/RenderableObject/RenderableBase";

type RenderCallback = (encoder: GPURenderBundleEncoder) => void;

export const CreateRenderBundle = (
  renderCallback: RenderCallback,
): GPURenderBundle => {
  const gpuManager = GPUManager.getInstance();
  const device = gpuManager.device as GPUDevice;
  const format = gpuManager.format as GPUTextureFormat;
  const sampleCount = gpuManager.sampleCount as number;
  const renderBundleEncoder = device.createRenderBundleEncoder({
    colorFormats: [format],
    depthStencilFormat: "depth32float",
    sampleCount: sampleCount,
  });

  renderCallback(renderBundleEncoder);

  return renderBundleEncoder.finish();
};

type RenderableObjectsMap = Map<string, Renderable[]>;

export const renderSceneGeneric = (
  renderPass: GPURenderPassEncoder | GPURenderBundleEncoder,
  pipeline: GPURenderPipeline,
  vsBindGroup: GPUBindGroup,
  lightBindGroup: GPUBindGroup,
  objects: RenderableObjectsMap
) => {
  renderPass.setPipeline(pipeline);
  renderPass.setBindGroup(0, vsBindGroup);
  renderPass.setBindGroup(1, lightBindGroup);
  let globalIndex = 0;

  for (const [type, objectsOfType] of objects.entries()) {
    if (type == "Cube") {
      renderPass.setVertexBuffer(0, Cube.renderBuffer.vertex);
      renderPass.setIndexBuffer(Cube.renderBuffer.index, "uint16");
      renderPass.drawIndexed(
        Cube.vertexCount,
        objectsOfType.length,
        0,
        0,
        globalIndex
      );
      globalIndex += objectsOfType.length;
      continue;
    }
    for (const object of objectsOfType) {
      object.render(renderPass, globalIndex);
      globalIndex++;
    }
  }
};
