struct Uniforms {
  modelViewProjectionMatrix: mat4x4<f32>,
}
@binding(0) @group(0) var<uniform> uniforms : Uniforms;

struct VertexOutput {
  @builtin(position) Position: vec4<f32>,
}

@vertex
fn main(
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>
) -> VertexOutput {
    var output: VertexOutput;
    output.Position = uniforms.modelViewProjectionMatrix * vec4(position, 1.0);
    return output;
}
