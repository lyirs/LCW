struct Uniforms {
  projectionMatrix: mat4x4<f32>,
  viewnMatrix: mat4x4<f32>,
}
@group(0) @binding(0) var<uniform> uniforms : Uniforms;
@group(0) @binding(1) var<uniform> lightProjection : mat4x4<f32>;
@group(0) @binding(2) var<storage> model : array<mat4x4<f32>>;
@group(0) @binding(3) var<storage> normal : array<mat4x4<f32>>;

@vertex
fn shadow(
    @builtin(instance_index) index: u32,
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
) -> @builtin(position) vec4<f32> {
    // 输出灯光视角下所有物体的投影空间坐标
    return lightProjection * model[index] * vec4<f32>(position, 1.0);
}

struct VertexOutput {
  @builtin(position) Position: vec4<f32>,
  @location(0) fragPosition: vec4<f32>,
  @location(1) fragNormal: vec3<f32>,
  @location(2) fragUV: vec2<f32>,
  @location(3) shadowPos: vec3<f32>,
}

@vertex
fn main(
    @builtin(instance_index) index: u32,
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>
) -> VertexOutput {
    let modelMatrix = model[index];
    let normalMatrix = normal[index];
    var output: VertexOutput;
    output.Position = uniforms.projectionMatrix * uniforms.viewnMatrix * modelMatrix * vec4(position, 1.0);
    output.fragUV = uv;
    output.fragNormal = (normalMatrix * vec4<f32>(normal, 0.0)).xyz;
    output.fragPosition = modelMatrix * vec4(position, 1.0);
    let posFromLight = lightProjection * modelMatrix * vec4<f32>(position, 1.0);
    output.shadowPos = vec3<f32>(posFromLight.xy * vec2<f32>(0.5, -0.5) + vec2<f32>(0.5, 0.5), posFromLight.z);
    return output;
}
