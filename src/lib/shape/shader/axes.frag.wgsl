@fragment
fn main(
    @location(0) fragPosition: vec4<f32>
) -> @location(0) vec4<f32> {
    if fragPosition.x > 0.5 {
        return vec4<f32>(1.0, 0.0, 0.0, 1.0);
    }
    if fragPosition.y > 0.5 {
        return vec4<f32>(0.0, 1.0, 0.0, 1.0);
    }
    if fragPosition.z > 0.5 {
        return vec4<f32>(0.0, 0.0, 1.0, 1.0);
    }
    return fragPosition;
}
