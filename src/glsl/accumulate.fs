precision highp float;
uniform sampler2D incidentTexture, lightTexture;
uniform vec2 resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec3 incident = texture2D(incidentTexture, uv).rgb;
  vec4 light = texture2D(lightTexture, uv);
  gl_FragColor = vec4(incident * exp(-light.a) + light.rgb, 1.0);
}
