import "./style.css";
import * as LCW from "./lib";
import { GUI } from "dat.gui";

const gpuManager = LCW.GPUManager.getInstance();
const canvas = document.querySelector("canvas") as HTMLCanvasElement;

await gpuManager.init(canvas);
gpuManager.sampleCount = 4;

const aspect = canvas.width / canvas.height;

const camera = new LCW.Camera();
camera.perspective(aspect);
camera.lookAt(new LCW.Vector3(0, 0, 20), new LCW.Vector3(0, 0, 0));

new LCW.CameraController(camera, canvas);

const box = new LCW.Box();
box.wireframe = true;
box.castShadow = true;
const sphere = new LCW.Sphere();
sphere.setPosition(new LCW.Vector3(4, 0, 0));
sphere.castShadow = true;
const axes = new LCW.Axes(5);
const plane = new LCW.Box();
plane.y = -1;
plane.setScale(new LCW.Vector3(10, 0.1, 10));
plane.castShadow = true;

const ambientLight = new LCW.AmbientLight();
ambientLight.setIntensity(0.2);
ambientLight.setColor(new LCW.Color("#b8fffa"));

const directionalLight = new LCW.DirectionalLight();
directionalLight.setPosition(new LCW.Vector3(0, 2, 10));
directionalLight.setIntensity(1);
directionalLight.setColor(new LCW.Color("#ffff00"));

const pointLight = new LCW.PointLight();
pointLight.setIntensity(3);
pointLight.setRadius(2);
pointLight.setPosition(new LCW.Vector3(0, 1.2, 0));
pointLight.setColor(new LCW.Color("#ff0000"));

const scene = new LCW.Scene();
scene.addObject(box);
scene.addObject(sphere);
scene.addObject(axes);
scene.addObject(plane);
scene.addLight(ambientLight);
scene.addLight(directionalLight);
// scene.addLight(pointLight);

scene.setStats();

// 渲染
const render = () => {
  const now = performance.now();
  directionalLight.setPosition(
    new LCW.Vector3(3 * Math.cos(now / 1500), 1, 3 * Math.sin(now / 1500))
  );
  scene.render(camera);
  requestAnimationFrame(render);
};
requestAnimationFrame(render);

const gui = new GUI();
const config = {
  环境光强度: 0.2,
  环境光颜色: "#b8fffa",
  直射光强度: 1,
  直射光颜色: "#ffff00",
  直射光X: 0,
  直射光Y: 2,
  直射光Z: 10,
  点光源强度: 3,
  点光源颜色: "#ff0000",
  点光源半径: 2,
  点光源Y: 1.2,
};
gui.add(config, "环境光强度", 0, 1, 0.01).onChange((value: number) => {
  ambientLight.setIntensity(value);
});
gui.addColor(config, "环境光颜色").onChange((color: string) => {
  ambientLight.setColor(new LCW.Color(color));
});

gui.add(config, "直射光强度", 0, 5, 0.05).onChange((value: number) => {
  directionalLight.setIntensity(value);
});
gui.addColor(config, "直射光颜色").onChange((color: string) => {
  directionalLight.setColor(new LCW.Color(color));
});
gui.add(config, "直射光X", -10, 10, 0.05).onChange((value: number) => {
  directionalLight.setPosition(
    new LCW.Vector3(
      value,
      directionalLight.position.y,
      directionalLight.position.z
    )
  );
});
gui.add(config, "直射光Y", 0, 10, 0.05).onChange((value: number) => {
  directionalLight.setPosition(
    new LCW.Vector3(
      directionalLight.position.x,
      value,
      directionalLight.position.z
    )
  );
});
gui.add(config, "直射光Z", -10, 10, 0.05).onChange((value: number) => {
  directionalLight.setPosition(
    new LCW.Vector3(
      directionalLight.position.x,
      directionalLight.position.y,
      value
    )
  );
});

gui.add(config, "点光源强度", 0, 20, 0.01).onChange((value: number) => {
  pointLight.setIntensity(value);
});
gui.addColor(config, "点光源颜色").onChange((color: string) => {
  pointLight.setColor(new LCW.Color(color));
});
gui.add(config, "点光源半径", 0, 5, 0.01).onChange((value: number) => {
  pointLight.setRadius(value);
});
gui.add(config, "点光源Y", -3, 3, 0.01).onChange((value: number) => {
  pointLight.setPosition(new LCW.Vector3(0, value, 0));
});

window.addEventListener("resize", () => {
  scene.resize(camera);
});
