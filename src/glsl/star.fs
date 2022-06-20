precision highp float;

uniform vec3 color, position;
uniform vec2 resolution, offset;
uniform float scale;
uniform float falloff;
uniform float diffractionSpikeFalloff;
uniform float diffractionSpikeScale;

void main() {
  vec2 p = scale * (gl_FragCoord.xy + offset);
  vec2 dl = scale * (position.xy) - p.xy;
  float spike = exp(-diffractionSpikeFalloff * abs(dl.x));
  spike += exp(-diffractionSpikeFalloff * abs(dl.y));
  spike *= exp(-1.0 / diffractionSpikeScale * falloff * length(dl));
  float light = spike + exp(-falloff * length(dl));
  gl_FragColor = vec4(light * 4.0 * normalize(color), 0.0);
}