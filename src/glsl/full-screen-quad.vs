precision highp float;

attribute vec2 position;

void main() {
  vec2 a = vec2(1.0);
  gl_Position = vec4(position, 0, 1);
}