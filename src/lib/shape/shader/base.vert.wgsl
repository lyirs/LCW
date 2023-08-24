struct Uniforms {
  projectionMatrix: mat4x4<f32>,
  viewnMatrix: mat4x4<f32>,
  modelMatrix: mat4x4<f32>,
  normalMatrix: mat4x4<f32>
}
@binding(0) @group(0) var<uniform> uniforms : Uniforms;

struct VertexOutput {
  @builtin(position) Position: vec4<f32>,
  @location(0) fragPosition: vec4<f32>,
  @location(1) fragNormal: vec3<f32>,
  @location(2) fragUV: vec2<f32>,
}

@vertex
fn main(
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>
) -> VertexOutput {
    var output: VertexOutput;
    output.Position = uniforms.projectionMatrix * uniforms.viewnMatrix * uniforms.modelMatrix * vec4(position, 1.0);
    output.fragUV = uv;
    output.fragNormal = (uniforms.normalMatrix * vec4<f32>(normal, 0.0)).xyz;
    output.fragPosition = uniforms.modelMatrix * vec4(position, 1.0);
    return output;
}
