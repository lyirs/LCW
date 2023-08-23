import "./style.css";
import * as LCW from "./lib";

const gpuManager = LCW.GPUManager.getInstance();
const canvas = document.querySelector("canvas") as HTMLCanvasElement;

await gpuManager.init(canvas);
gpuManager.sampleCount = 4;

const aspect = canvas.width / canvas.height;

const camera = new LCW.Camera();
camera.perspective(aspect);
camera.lookAt({ x: 0, y: 0, z: 10 }, { x: 0, y: 0, z: 0 });

new LCW.CameraController(camera, canvas);

const box = new LCW.Box();
const axes = new LCW.Axes(5);

const scene = new LCW.Scene();
scene.addObject(box);
scene.addObject(axes);
scene.setStats();

// box.setRotation({ x: 1, y: 1, z: 0 });
// axes.setRotation({ x: 1, y: 1, z: 0 });

// 渲染
const render = () => {
  scene.render(camera);
  requestAnimationFrame(render);
};
requestAnimationFrame(render);
