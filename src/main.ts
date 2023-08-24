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
camera.lookAt(new LCW.Vector3(0, 0, 10), new LCW.Vector3(0, 0, 0));

new LCW.CameraController(camera, canvas);

const box = new LCW.Box();
const axes = new LCW.Axes(5);

const ambientLight = new LCW.AmbientLight();
ambientLight.setIntensity(0.5);
ambientLight.setColor(new LCW.Color("#b8fffa"));

const directionalLight = new LCW.DirectionalLight();
directionalLight.setIntensity(0.5);
directionalLight.setColor(new LCW.Color("#ffff00"));

const scene = new LCW.Scene();
scene.addObject(box);
scene.addObject(axes);
scene.addLight(ambientLight);
scene.addLight(directionalLight);
scene.setStats();

// 渲染
const render = () => {
  const now = performance.now();
  directionalLight.setPosition(
    new LCW.Vector3(Math.cos(now / 1500), 0, Math.sin(now / 1500))
  );
  scene.render(camera);
  requestAnimationFrame(render);
};
requestAnimationFrame(render);

const gui = new GUI();
const config = {
  环境光强度: 0.5,
  环境光颜色: "#b8fffa",
  直射光强度: 0.5,
  直射光颜色: "#ffff00",
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

window.addEventListener("resize", () => {
  scene.resize(camera);
});
