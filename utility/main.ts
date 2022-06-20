import Alea from "alea";
import { Pane } from "tweakpane";

import { Space2D, RenderOptions, Star } from "../src/index";

import { blackBodyColors } from "./black-body";

const space2d = new Space2D();
const canvas = document.getElementById("render-canvas") as HTMLCanvasElement;
let rendering = false;

async function render(seed: string) {
  if (!seed) {
    return;
  }

  if (rendering) {
    rendering = false;
    await animationFrame();
  }

  rendering = true;

  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  await animationFrame();

  const chunkSize = 256;

  const prng = Alea(seed);

  const sceneOffset = [prng() * 10000000 - 5000000, prng() * 10000000 - 5000000];
  sceneOffset[0] -= 0.5 * canvas.width;
  sceneOffset[1] -= 0.5 * canvas.height;

  const near = 0;
  const far = 500;
  const layers = 2 * (far - near);

  const scale = 0.001 + prng() * 0.001;

  const stars: Star[] = [];
  const nStars = Math.min(64, 1 + Math.round(prng() * (canvas.width * canvas.height) * scale * scale));

  for (let i = 0; i < nStars; i++) {
    const color = blackBodyColors[Math.floor(prng() * blackBodyColors.length)].slice();
    const intensity = 0.5 * prng();
    color[0] *= intensity;
    color[1] *= intensity;
    color[2] *= intensity;
    stars.push({
      position: [sceneOffset[0] + prng() * canvas.width, sceneOffset[1] + prng() * canvas.height, near + prng() * (far - near)],
      color,
      falloff: 256,
      diffractionSpikeFalloff: 1024,
      diffractionSpikeScale: 4 + 4 * prng(),
    });
  }

  const backgroundColor = blackBodyColors[Math.floor(prng() * blackBodyColors.length)].slice();
  const intensity = 0.5 * prng();
  backgroundColor[0] *= intensity;
  backgroundColor[1] *= intensity;
  backgroundColor[2] *= intensity;

  const opts: RenderOptions = {
    stars,
    scale,
    backgroundColor,
    nebulaLacunarity: 1.8 + 0.2 * prng(),
    nebulaGain: 0.5,
    nebulaAbsorption: 1.0,
    nebulaFalloff: 256 + prng() * 1024,
    nebulaNear: near,
    nebulaFar: far,
    nebulaLayers: layers,
    nebulaDensity: (50 + prng() * 100) / layers,
    nebulaAlbedoLow: [prng(), prng(), prng()],
    nebulaAlbedoHigh: [prng(), prng(), prng()],
    nebulaAlbedoScale: prng() * 8,
  };

  for (let y = 0; y < canvas.height; y += chunkSize) {
    for (let x = 0; x < canvas.width; x += chunkSize) {
      ctx.drawImage(
        space2d.render(chunkSize, chunkSize, { offset: [x + sceneOffset[0], y + sceneOffset[1]], ...opts }),
        x,
        canvas.height - (y + chunkSize)
      );
      await animationFrame();
      if (!rendering) {
        return;
      }
    }
  }

  rendering = false;
}

function generateSeed() {
  const alphanum = "abcdefghijklmnopqrstuvqxyz1234567890";
  let seed = "";
  for (let i = 0; i < 22; i++) {
    seed += alphanum[Math.floor(Math.random() * alphanum.length)];
  }
  return seed;
}

function resizeCanvas(width: number, height: number) {
  canvas.width = width;
  canvas.height = height;
  scaleCanvas();
}

function scaleCanvas() {
  const widthScale = window.innerWidth / canvas.width;
  const heightScale = window.innerHeight / canvas.height;
  const scale = Math.min(widthScale, heightScale);
  if (scale < 1.0) {
    const width = scale * canvas.width;
    const height = scale * canvas.height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.left = `${Math.round(0.5 * (window.innerWidth - width))}px`;
    canvas.style.top = `${Math.round(0.5 * (window.innerHeight - height))}px`;
  } else {
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
    canvas.style.left = `${Math.round(0.5 * (window.innerWidth - canvas.width))}px`;
    canvas.style.top = `${Math.round(0.5 * (window.innerHeight - canvas.height))}px`;
  }
}

interface Params {
  seed: string;
  width: number;
  height: number;
}

function updateParams(params: Params) {
  history.replaceState(null, "", `?seed=${params.seed}&width=${params.width}&height=${params.height}`);
}

async function main() {
  var queryParams = new URLSearchParams(window.location.search);
  const params: Params = {
    seed: queryParams.get("seed") ?? generateSeed(),
    width: parseInt(queryParams.get("width") ?? window.innerWidth.toString()),
    height: parseInt(queryParams.get("height") ?? window.innerHeight.toString()),
  };
  const pane = new Pane({ title: "Options" });
  pane.addInput(params, "seed");
  pane.addButton({ title: "Randomize & Render", label: "" }).on("click", () => {
    params.seed = generateSeed();
    pane.refresh();
    updateParams(params);
    render(params.seed);
  });
  pane.addInput(params, "width", { step: 1 }).on("change", () => {
    resizeCanvas(params.width, params.height);
  });
  pane.addInput(params, "height", { step: 1 }).on("change", () => {
    resizeCanvas(params.width, params.height);
  });
  pane.addButton({ title: "Render", label: "" }).on("click", () => {
    updateParams(params);
    render(params.seed);
  });
  pane.addButton({ title: "Download", label: "" }).on("click", () => {
    const image = canvas.toDataURL();
    const link = document.createElement("a");
    link.download = `${params.seed}.png`;
    link.href = image;
    link.click();
  });

  resizeCanvas(params.width, params.height);

  window.addEventListener("resize", () => {
    scaleCanvas();
  });

  await animationFrame();
  updateParams(params);
  await render(params.seed);
}

main();

function animationFrame() {
  return new Promise((accept) => {
    requestAnimationFrame(accept);
  });
}
