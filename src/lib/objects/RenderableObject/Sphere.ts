import { mat4, vec3 } from "wgpu-matrix";
import {
  CreateGPUBufferF32,
  CreateGPUBufferUint16,
} from "../../helper/gpuBuffer";
import { RenderableObject } from "./RenderableBase";

const createSphere = (
  radius: number,
  widthSegments: number, // 横向分段
  heightSegments: number, // 纵向分段
  randomness: number // 使顶点在球体表面上产生微小的变化。这样的变化在视觉上会让球体的外观更加自然
) => {
  const vertices = [];
  const indices = [];

  widthSegments = Math.max(3, Math.floor(widthSegments));
  heightSegments = Math.max(2, Math.floor(heightSegments));

  const firstVertex = vec3.create();
  const vertex = vec3.create();
  const normal = vec3.create();

  let index = 0;
  // grid 数组用于存储每一行顶点的索引，构建了一个高度分段 x 宽度分段的矩阵结构。
  const grid = [];

  // 嵌套循环遍历高度分段（iy）和宽度分段（ix），根据当前的分段位置计算每个顶点的位置、法线和纹理坐标，然后将这些数据添加到相应的数组中。
  for (let iy = 0; iy <= heightSegments; iy++) {
    const verticesRow = []; // 存储当前分段的顶点索引。
    const v = iy / heightSegments; // 计算当前纵向分段的纹理坐标 v，范围在 0 到 1 之间

    // 根据当前纵向分段 iy 的位置，计算一个纹理坐标的偏移 uOffset。这个偏移将在球体的极点（顶部和底部）产生。
    // 当 iy 是 0 时，将 uOffset 设置为一个正数，以便在顶部极点周围生成纹理坐标。
    // 当 iy 是 heightSegments 时，将 uOffset 设置为一个负数，以便在底部极点周围生成纹理坐标。
    // 在球体的极点（顶部和底部）附近微调纹理坐标，以确保纹理在极点周围不会出现不连续或扭曲的情况。
    let uOffset = 0;
    if (iy === 0) {
      uOffset = 0.5 / widthSegments;
    } else if (iy === heightSegments) {
      uOffset = -0.5 / widthSegments;
    }

    // 计算当前横向分段的纹理坐标 u，范围在 0 到 1 之间。
    // 检查是否处于当前纵向分段的最后一个横向分段（ix == widthSegments）。
    //   如果是最后一个分段，将当前顶点复制到 firstVertex，这是为了确保极点的闭合。
    //   确保这个点和上一个纵向分段的最后一个点能够连接起来。
    // 对于其他情况，根据 ix 和 iy 的位置来生成顶点坐标。
    //   计算随机偏移量 rr，将其加到球体的半径上，这是为了引入随机性。
    //   根据球坐标系的公式计算顶点坐标 vertex。
    //   如果是当前横向分段的第一个顶点（ix == 0），将 firstVertex 复制到 vertex，以确保每个环的首尾相连。
    for (let ix = 0; ix <= widthSegments; ix++) {
      const u = ix / widthSegments;

      if (ix == widthSegments) {
        vec3.copy(firstVertex, vertex);
      } else if (ix == 0 || (iy != 0 && iy !== heightSegments)) {
        const rr = radius + (Math.random() - 0.5) * 2 * randomness * radius;

        vertex[0] = -rr * Math.cos(u * Math.PI * 2) * Math.sin(v * Math.PI);
        vertex[1] = rr * Math.cos(v * Math.PI);
        vertex[2] = rr * Math.sin(u * Math.PI * 2) * Math.sin(v * Math.PI);

        if (ix == 0) {
          vec3.copy(vertex, firstVertex);
        }
      }

      vertices.push(...vertex);

      // normal
      // 复制当前顶点坐标到 normal，然后对 normal 进行规范化，以计算出法线向量
      vec3.copy(vertex, normal);
      vec3.normalize(normal, normal);
      vertices.push(...normal);

      // uv
      vertices.push(u + uOffset, 1 - v);
      verticesRow.push(index++);
    }

    grid.push(verticesRow);
  }

  // indices
  // 使用嵌套循环遍历高度分段和宽度分段，为每个矩形生成两个三角形的索引。
  // 根据当前矩形的顶点索引，生成四个顶点 a、b、c 和 d。
  for (let iy = 0; iy < heightSegments; iy++) {
    for (let ix = 0; ix < widthSegments; ix++) {
      const a = grid[iy][ix + 1];
      const b = grid[iy][ix];
      const c = grid[iy + 1][ix];
      const d = grid[iy + 1][ix + 1];

      if (iy !== 0) indices.push(a, b, d);
      if (iy !== heightSegments - 1) indices.push(b, c, d);
    }
  }

  return {
    vertices: new Float32Array(vertices),
    indices: new Uint16Array(indices),
  };
};

export class Sphere extends RenderableObject {
  public vertexCount: number;
  private vertices: Float32Array;
  private indices: Uint16Array;
  public static vertex = createSphere(1, 32, 16, 0).vertices;
  public static index = createSphere(1, 32, 16, 0).indices;

  constructor() {
    super();
    this.vertices = createSphere(1, 32, 16, 0).vertices;
    this.indices = createSphere(1, 32, 16, 0).indices;
    this.vertexCount = this.indices.length;
  }
}
