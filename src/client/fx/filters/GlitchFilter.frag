
precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float time;
uniform vec2 resolution;

#define M_PI 3.1415926535897932384626433832795

float rand(vec2 n) {
  return fract(sin(dot(n.xy, vec2(12.9898,78.233))) * 43758.5453);
}

float qScanLine(vec2 uv, float n) {
  return 0.1 * sin((uv.y + time * .05) * M_PI * n) + 0.9; 
}

vec2 vDirShift(vec2 uv, float angle, float q) {
  float a = angle / 180.0 * M_PI;
  vec2 dir = vec2(sin(a), cos(a));
  return uv + dir * q;
}

vec4 cSignalNoise(vec4 cCol, float q, vec2 gPos) {
  float s = smoothstep(q, .998, rand(gPos + time));
  return cCol + s * (1.-s + 0.2);// * (1.0 - q) + q * rand(gPos + time);
}

vec4 vRGBWithShift(vec2 uv, float angle, float q) {
  vec2 rPos = vDirShift (uv, angle, q);
  vec2 gPos = uv;
  vec2 bPos = vDirShift (uv, -angle, q);

  vec4 rPix = texture2D(uSampler, rPos);
  vec4 gPix = texture2D(uSampler, gPos);
  vec4 bPix = texture2D(uSampler, bPos);

  return vec4(rPix.x, gPix.y, bPix.z, 0.0);
}

void main() {
  float wave1 = 0.3 * sin(time * 2.) + 0.70;
  float wave2 = 0.5 * sin(time * 3.) + 0.5;

  vec2 gPos = vTextureCoord;
  // vec2 cPos = gPos;

  vec4 cCol = vec4(1.0, 1.0, 1.0, 0.0);
  // vec2 bPos = vec2(1.0);

  float glitch = rand(vec2(time, -time)) * 2.;

  cCol = vRGBWithShift(gPos, 7200. * glitch, 0.0005 * glitch) * wave1;
  // cCol = cCol * qScanLine(gPos, 4.0);
  // cCol = cCol * qScanLine(gPos, 8.0);
  // cCol = cSignalNoise(cCol, 0.994, gPos);

  gl_FragColor = cCol;
}
