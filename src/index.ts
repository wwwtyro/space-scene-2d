import REGL from "regl";
import Alea from "alea";

import fullscreenQuadVertex from "./glsl/full-screen-quad.vs?raw";
import nebulaFragment from "./glsl/nebula.fs?raw";
import starFragment from "./glsl/star.fs?raw";
import starsFragment from "./glsl/stars.fs?raw";
import backgroundFragment from "./glsl/background.fs?raw";
import pasteFragment from "./glsl/paste.fs?raw";
import accumulateFragment from "./glsl/accumulate.fs?raw";

export class Space2D {
  private canvas: HTMLCanvasElement;
  private regl: REGL.Regl;
  private renderStars: REGL.DrawCommand;
  private renderBackground: REGL.DrawCommand;
  private renderNebula: REGL.DrawCommand;
  private renderStar: REGL.DrawCommand;
  private paste: REGL.DrawCommand;
  private accumulate: REGL.DrawCommand;
  private pingpong: REGL.Framebuffer2D[];
  private fbLight: REGL.Framebuffer2D;
  private starPositionTexture: REGL.Texture2D;
  private starColorTexture: REGL.Texture2D;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.canvas.height = 0;
    this.regl = REGL({
      canvas: this.canvas,
      attributes: {
        preserveDrawingBuffer: true,
        alpha: false,
      },
      extensions: ["OES_texture_float"],
    });

    const prng = Alea("alea seed");

    const starSize = 1024;
    const rawStarData = new Uint8ClampedArray(starSize * starSize);
    for (let i = 0; i < rawStarData.length; i++) {
      rawStarData[i] = Math.floor(prng() * 256);
    }

    const starTexture = this.regl.texture({
      data: rawStarData,
      width: starSize,
      height: starSize,
      format: "alpha",
      wrap: "repeat",
    });

    this.renderStars = this.regl({
      vert: fullscreenQuadVertex,
      frag: starsFragment,
      attributes: {
        position: this.regl.buffer([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]),
      },
      uniforms: {
        starTexture,
        offset: this.regl.prop<any, any>("offset"),
        density: this.regl.prop<any, any>("density"),
        brightness: this.regl.prop<any, any>("brightness"),
        resolution: [starSize, starSize],
      },
      depth: {
        enable: false,
      },
      count: 6,
      viewport: this.regl.prop<any, any>("viewport"),
      framebuffer: this.regl.prop<any, any>("framebuffer"),
    });

    this.renderBackground = this.regl({
      vert: fullscreenQuadVertex,
      frag: backgroundFragment,
      attributes: {
        position: this.regl.buffer([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]),
      },
      uniforms: {
        depth: this.regl.prop<any, any>("depth"),
        color: this.regl.prop<any, any>("color"),
        scale: this.regl.prop<any, any>("scale"),
        lacunarity: this.regl.prop<any, any>("lacunarity"),
        gain: this.regl.prop<any, any>("gain"),
        octaves: this.regl.prop<any, any>("octaves"),
        density: this.regl.prop<any, any>("density"),
        falloff: this.regl.prop<any, any>("falloff"),
        offset: this.regl.prop<any, any>("offset"),
        resolution: this.regl.prop<any, any>("resolution"),
      },
      depth: {
        enable: false,
      },
      blend: {
        enable: true,
        func: {
          src: "one",
          dst: "one",
        },
      },
      count: 6,
      viewport: this.regl.prop<any, any>("viewport"),
      framebuffer: this.regl.prop<any, any>("framebuffer"),
    });

    this.renderNebula = this.regl({
      vert: fullscreenQuadVertex,
      frag: nebulaFragment,
      attributes: {
        position: this.regl.buffer([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]),
      },
      uniforms: {
        depth: this.regl.prop<any, any>("depth"),
        starPositionTexture: this.regl.prop<any, any>("starPositionTexture"),
        starColorTexture: this.regl.prop<any, any>("starColorTexture"),
        nStars: this.regl.prop<any, any>("nStars"),
        scale: this.regl.prop<any, any>("scale"),
        absorption: this.regl.prop<any, any>("absorption"),
        emissiveLow: this.regl.prop<any, any>("emissiveLow"),
        emissiveHigh: this.regl.prop<any, any>("emissiveHigh"),
        emissiveOffset: this.regl.prop<any, any>("emissiveOffset"),
        emissiveScale: this.regl.prop<any, any>("emissiveScale"),
        albedoLow: this.regl.prop<any, any>("albedoLow"),
        albedoHigh: this.regl.prop<any, any>("albedoHigh"),
        albedoOffset: this.regl.prop<any, any>("albedoOffset"),
        albedoScale: this.regl.prop<any, any>("albedoScale"),
        lacunarity: this.regl.prop<any, any>("lacunarity"),
        gain: this.regl.prop<any, any>("gain"),
        octaves: this.regl.prop<any, any>("octaves"),
        density: this.regl.prop<any, any>("density"),
        falloff: this.regl.prop<any, any>("falloff"),
        offset: this.regl.prop<any, any>("offset"),
      },
      depth: {
        enable: false,
      },
      blend: {
        enable: true,
        func: {
          src: "one",
          dst: "one",
        },
      },
      count: 6,
      viewport: this.regl.prop<any, any>("viewport"),
      framebuffer: this.regl.prop<any, any>("framebuffer"),
    });

    this.renderStar = this.regl({
      vert: fullscreenQuadVertex,
      frag: starFragment,
      attributes: {
        position: this.regl.buffer([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]),
      },
      uniforms: {
        position: this.regl.prop<any, any>("position"),
        color: this.regl.prop<any, any>("color"),
        diffractionSpikeFalloff: this.regl.prop<any, any>("diffractionSpikeFalloff"),
        diffractionSpikeScale: this.regl.prop<any, any>("diffractionSpikeScale"),
        scale: this.regl.prop<any, any>("scale"),
        falloff: this.regl.prop<any, any>("falloff"),
        offset: this.regl.prop<any, any>("offset"),
        resolution: this.regl.prop<any, any>("resolution"),
      },
      depth: {
        enable: false,
      },
      blend: {
        enable: true,
        func: {
          src: "one",
          dst: "one",
        },
      },
      count: 6,
      viewport: this.regl.prop<any, any>("viewport"),
      framebuffer: this.regl.prop<any, any>("framebuffer"),
    });

    this.paste = this.regl({
      vert: fullscreenQuadVertex,
      frag: pasteFragment,
      attributes: {
        position: this.regl.buffer([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]),
      },
      uniforms: {
        texture: this.regl.prop<any, any>("texture"),
        resolution: this.regl.prop<any, any>("resolution"),
      },
      depth: {
        enable: false,
      },
      count: 6,
      viewport: this.regl.prop<any, any>("viewport"),
      framebuffer: this.regl.prop<any, any>("framebuffer"),
    });

    this.accumulate = this.regl({
      vert: fullscreenQuadVertex,
      frag: accumulateFragment,
      attributes: {
        position: this.regl.buffer([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]),
      },
      uniforms: {
        incidentTexture: this.regl.prop<any, any>("incidentTexture"),
        lightTexture: this.regl.prop<any, any>("lightTexture"),
        resolution: this.regl.prop<any, any>("resolution"),
      },
      depth: {
        enable: false,
      },
      count: 6,
      viewport: this.regl.prop<any, any>("viewport"),
      framebuffer: this.regl.prop<any, any>("framebuffer"),
    });

    this.pingpong = [
      this.regl.framebuffer({ colorType: "float", depth: false }),
      this.regl.framebuffer({ colorType: "float", depth: false }),
    ];

    this.fbLight = this.regl.framebuffer({ colorType: "float", depth: false });
    this.starPositionTexture = this.regl.texture();
    this.starColorTexture = this.regl.texture();
  }

  render(width: number, height: number, options: RenderOptions = {}) {
    const opts = { ...renderConfigDefaults(), ...options };

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.pingpong[0]({ width, height });
      this.pingpong[1]({ width, height });
      this.fbLight({ width, height });
    }

    const viewport = { x: 0, y: 0, width, height };

    this.regl.clear({ color: [0, 0, 0, 0] });
    this.regl.clear({ color: [0, 0, 0, 0], framebuffer: this.fbLight });
    this.regl.clear({ color: [0, 0, 0, 0], framebuffer: this.pingpong[0] });
    this.regl.clear({ color: [0, 0, 0, 0], framebuffer: this.pingpong[1] });

    let pingIndex = 0;

    if (opts.stars.length === 0) {
      opts.stars.push({
        position: [0, 0, 0],
        color: [0, 0, 0],
        falloff: 0,
        diffractionSpikeFalloff: 0,
        diffractionSpikeScale: 0,
      });
    }

    this.starPositionTexture({
      data: opts.stars.flatMap((s) => s.position),
      width: opts.stars.length,
      height: 1,
      type: "float",
      format: "rgb",
    });

    this.starColorTexture({
      data: opts.stars.flatMap((s) => s.color),
      width: opts.stars.length,
      height: 1,
      type: "float",
      format: "rgb",
    });

    this.renderStars({
      offset: opts.offset,
      density: opts.backgroundStarDensity,
      brightness: opts.backgroundStarBrightness,
      viewport,
      framebuffer: this.pingpong[0],
    });

    this.renderBackground({
      color: opts.backgroundColor,
      depth: opts.backgroundDepth,
      resolution: [width, height],
      offset: opts.offset,
      lacunarity: opts.backgroundLacunarity,
      gain: opts.backgroundGain,
      density: opts.backgroundDensity,
      octaves: opts.backgroundOctaves,
      falloff: opts.backgroundFalloff,
      scale: opts.backgroundScale,
      viewport,
      framebuffer: this.pingpong[0],
    });

    this.paste({
      resolution: [width, height],
      texture: this.pingpong[0],
      viewport,
    });

    for (let i = 0; i < opts.nebulaLayers; i++) {
      const depth = opts.nebulaFar - (i * (opts.nebulaFar - opts.nebulaNear)) / (opts.nebulaLayers - 1);
      this.regl.clear({ color: [0, 0, 0, 0], framebuffer: this.fbLight });
      this.renderNebula({
        depth,
        starPositionTexture: this.starPositionTexture,
        starColorTexture: this.starColorTexture,
        nStars: opts.stars.length,
        offset: opts.offset,
        absorption: opts.nebulaAbsorption,
        lacunarity: opts.nebulaLacunarity,
        gain: opts.nebulaGain,
        albedoLow: opts.nebulaAlbedoLow,
        albedoHigh: opts.nebulaAlbedoHigh,
        albedoOffset: opts.nebulaAlbedoOffset,
        albedoScale: opts.nebulaAlbedoScale,
        emissiveLow: opts.nebulaEmissiveLow,
        emissiveHigh: opts.nebulaEmissiveHigh,
        emissiveOffset: opts.nebulaEmissiveOffset,
        emissiveScale: opts.nebulaEmissiveScale,
        density: opts.nebulaDensity,
        octaves: opts.nebulaOctaves,
        falloff: opts.nebulaFalloff,
        scale: opts.scale,
        viewport,
        framebuffer: this.fbLight,
      });
      this.accumulate({
        resolution: [width, height],
        incidentTexture: this.pingpong[pingIndex],
        lightTexture: this.fbLight,
        viewport,
        framebuffer: this.pingpong[1 - pingIndex],
      });
      pingIndex = 1 - pingIndex;
    }

    for (const star of opts.stars) {
      this.renderStar({
        position: star.position,
        color: star.color,
        falloff: star.falloff,
        diffractionSpikeFalloff: star.diffractionSpikeFalloff,
        diffractionSpikeScale: star.diffractionSpikeScale,
        offset: opts.offset,
        scale: opts.scale,
        resolution: [width, height],
        viewport,
        framebuffer: this.pingpong[pingIndex],
      });
    }

    this.paste({
      resolution: [width, height],
      texture: this.pingpong[pingIndex],
      viewport,
    });

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(this.canvas, 0, 0);
    return canvas;
  }
}

export interface Star {
  position: number[];
  color: number[];
  falloff: number;
  diffractionSpikeFalloff: number;
  diffractionSpikeScale: number;
}

export type RenderOptions = Partial<ReturnType<typeof renderConfigDefaults>>;

function renderConfigDefaults() {
  return {
    scale: 0.002,
    offset: [0, 0],
    backgroundColor: [0.125, 0.125, 0.25],
    backgroundDepth: 137,
    backgroundLacunarity: 2,
    backgroundGain: 0.5,
    backgroundDensity: 2.0,
    backgroundOctaves: 8,
    backgroundFalloff: 8,
    backgroundScale: 0.003,
    backgroundStarDensity: 0.05,
    backgroundStarBrightness: 0.125,
    nebulaNear: 0,
    nebulaFar: 500,
    nebulaLayers: 1000,
    nebulaAbsorption: 1.0,
    nebulaLacunarity: 2.0,
    nebulaDensity: 0.1,
    nebulaGain: 0.5,
    nebulaOctaves: 7,
    nebulaFalloff: 4,
    nebulaEmissiveLow: [0, 0, 0],
    nebulaEmissiveHigh: [0, 0, 0],
    nebulaEmissiveOffset: [0, 0, 0],
    nebulaEmissiveScale: 1,
    nebulaAlbedoLow: [1, 1, 1],
    nebulaAlbedoHigh: [1, 1, 1],
    nebulaAlbedoOffset: [0, 0, 0],
    nebulaAlbedoScale: 1,
    stars: [] as Star[],
  };
}
