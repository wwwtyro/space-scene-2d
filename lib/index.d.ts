export declare class Space2D {
    private canvas;
    private regl;
    private renderStars;
    private renderBackground;
    private renderNebula;
    private renderStar;
    private paste;
    private accumulate;
    private pingpong;
    private fbLight;
    private starPositionTexture;
    private starColorTexture;
    constructor();
    render(width: number, height: number, options?: RenderOptions): HTMLCanvasElement;
}
export interface Star {
    position: number[];
    color: number[];
    falloff: number;
    diffractionSpikeFalloff: number;
    diffractionSpikeScale: number;
}
export declare type RenderOptions = Partial<ReturnType<typeof renderConfigDefaults>>;
declare function renderConfigDefaults(): {
    scale: number;
    offset: number[];
    backgroundColor: number[];
    backgroundDepth: number;
    backgroundLacunarity: number;
    backgroundGain: number;
    backgroundDensity: number;
    backgroundOctaves: number;
    backgroundFalloff: number;
    backgroundScale: number;
    backgroundStarDensity: number;
    backgroundStarBrightness: number;
    nebulaNear: number;
    nebulaFar: number;
    nebulaLayers: number;
    nebulaAbsorption: number;
    nebulaLacunarity: number;
    nebulaDensity: number;
    nebulaGain: number;
    nebulaOctaves: number;
    nebulaFalloff: number;
    nebulaEmissiveLow: number[];
    nebulaEmissiveHigh: number[];
    nebulaEmissiveOffset: number[];
    nebulaEmissiveScale: number;
    nebulaAlbedoLow: number[];
    nebulaAlbedoHigh: number[];
    nebulaAlbedoOffset: number[];
    nebulaAlbedoScale: number;
    stars: Star[];
};
export {};
//# sourceMappingURL=index.d.ts.map