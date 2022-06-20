precision highp float;

uniform sampler2D starTexture;
uniform vec2 resolution;
uniform vec2 offset;
uniform float density;
uniform float brightness;

void main() {
  vec2 xy = (offset + gl_FragCoord.xy) / resolution;

  if (texture2D(starTexture, xy).a > density) {
    discard;
  };

  float alpha = texture2D(starTexture, xy + 0.5).a;
  float c = log(1.0 - alpha) * -brightness;
  gl_FragColor = vec4(c, c, c, 1);
}