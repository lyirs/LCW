@group(1) @binding(0) var<uniform> ambientLight : array<vec4<f32>, 2>;
@group(1) @binding(1) var<uniform> pointLight : array<vec4<f32>, 2>;
@group(1) @binding(2) var<uniform> directionLight : array<vec4<f32>, 2>;

@fragment
fn main(
    @location(0) fragPosition: vec4<f32>,
    @location(1) fragNormal: vec3<f32>,
    @location(2) fragUV: vec2<f32>,
) -> @location(0) vec4<f32> {
    var objectColor = vec3<f32>(1.0, 1.0, 1.0);
    var ambientLightColor = vec3(1.0, 1.0, 1.0);  // 环境光
    var dirLightColor = vec3(1.0, 1.0, 1.0);  // 直射光
    var pointLightColor = vec3(1.0, 1.0, 1.0);  // 点光源

    var lightResult = vec3(0.0, 0.0, 0.0);
    // 环境光
    var ambientIntensity = 1.0 * ambientLight[0][3];
    ambientLightColor = ambientLightColor * ambientLight[1].rgb;
    lightResult += ambientLightColor * ambientIntensity;
    // 直射光
    var directionPosition = directionLight[0].xyz;
    var directionIntensity: f32 = directionLight[0][3];
    dirLightColor = dirLightColor * directionLight[1].rgb;
    let N: vec3<f32> = normalize(fragNormal); // 法线  
    let DL: vec3<f32> = normalize(directionPosition);  // 光线方向
    // diffuse变量代表了漫反射的强度，即光线照射到表面后散射开的光的强度。
    // 在这个计算中，使用了 Lambert 光照模型，其基本思想是光线与表面的入射角越小（也就是说，光线越垂直于表面），表面反射的光就越强。
    // dot(normalize(directionPosition), fragNormal)这部分计算了定向光源的方向（经过归一化处理）与片元的法线向量的点积，这个点积的结果将决定光线入射角度的余弦值。
    // 当这两个向量越接近，即它们的夹角越小，那么点积的结果就越接近1，说明光线更加垂直于物体表面，漫反射效果就越强。
    // 通过max(dot(normalize(directionPosition), fragNormal), 0.0)保证了当点积结果小于0（也就是光源方向和法线方向的夹角大于90度）时，漫反射强度为0
    // 也就是说，当光源在物体的后方时，不会产生漫反射效果。
    // 得到的diffuse值在0到1之间，表示了定向光对于这个片元的漫反射强度
    var diffuse: f32 = max(dot(N, DL), 0.0);
    lightResult += dirLightColor * directionIntensity * diffuse;

    // 点光源
    var pointPosition = pointLight[0].xyz;
    var pointIntensity: f32 = pointLight[0][3];
    pointLightColor = pointLightColor * pointLight[1].rgb;
    var pointRadius = pointLight[1][3];
    let PL: vec3<f32> = normalize(pointPosition - fragPosition.xyz);  // 光线方向
    var distance = length(PL);
    if distance < pointRadius {
        diffuse = max(dot(N, PL), 0.0);
        var distanceFactor: f32 = pow(1.0 - distance / pointRadius, 2.0);
        lightResult += pointLightColor * pointIntensity * diffuse * distanceFactor;
    }

    return vec4<f32>(objectColor * lightResult, 1.0);
}
