
precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float scale;
uniform float time;
uniform vec2 resolution;
uniform vec2 transform;

// nebula settings
const int niterations = 2;
const vec3 c1 = vec3(0.0, 0.3, 0.6);
const vec3 c2 = vec3(0.2, 0.2, 0.2);
const vec3 c3 = vec3(0.0, 0.0, 0.0);
const vec3 c4 = vec3(0.0, 0.2, 0.2);
const vec3 c5 = vec3(0.1);
const vec3 c6 = vec3(0.2);

float rand(vec2 n) {
  return fract(sin(dot(n.xy, vec2(2.9898,8.233))) * 3758.5453);
}

float noise(vec2 n) {
  const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
  return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

float fbm(vec2 n) {
  float total = 0.0, amplitude = 1.0;
  for (int i = 0; i < niterations; i++) {
    total += noise(n) * amplitude;
    n += n;
    amplitude *= 0.5;
  }
  return total;
}

vec3 nebula(vec2 position) {
  float ntime = time * 0.2;
  float q = fbm(position - ntime * 0.1);
  vec2 r = vec2(fbm(position + q + ntime * 0.7 - position.x - position.y), fbm(position + q - ntime * 0.4));
  return mix(c1, c2, fbm(position + r)) + mix(c3, c4, r.x) - mix(c5, c6, r.y);
}

void main(void) {
  float s = 1. / (scale * 4.) + 0.75;
  vec4 tex = texture2D(uSampler, vTextureCoord);
  vec2 pos = (-resolution.xy + 2. * (gl_FragCoord.xy)) / resolution.y;
  vec2 position2 = (1.0 * s) * pos - (transform.xy / 500.);
  vec4 nebula = vec4(nebula(position2), tex.a);
  
  gl_FragColor = mix(tex, tex + (nebula*nebula*nebula*3.), 3.);
}
