precision lowp float;

varying vec2 vTextureCoord;

uniform float dist;
uniform float glow;
uniform float offset;
uniform vec3 color;

// rendering params
const float sphsize = 0.80;
const float start = 0.0;
const float steps = 512.0;
const float stepsize = 0.006;

float atmosphere(vec3 p, float d, float g) {
  float len = max(0.0, d - max(0.0, length(p) - sphsize) / sphsize) / d;
  return length(p) * (len * g) + len * g;
}

void main() {
  vec2 uv = vTextureCoord - vec2(0.5, 0.5);
  vec3 pos = vec3(uv, 0.0);
  vec3 l = normalize(vec3(1.0, 0.0, 1.0));

  vec3 dir = vec3(uv, 1.0);
  vec3 from = vec3(0.0, 0.0, -2.0);
  vec3 col = vec3(0.0, 0.0, 0.0);

  float v = 0.0;
  for(float r=start; r<steps; r++) {
    vec3 p = from + r * dir * stepsize;

    if(length(p)-sphsize>0.0) {
      v += atmosphere(p, dist, glow*3.6);
    }
  }

  float w = 0.0;
  for(float r=start; r<steps; r++) {
    vec3 p = from + r * dir * stepsize;

    if(length(p)-sphsize>0.0) {
      w += atmosphere(p, dist * 5.0, glow*0.4);
    }
  }

  // outer atmosphere
  w /= steps;
  w *= 0.5;

  // inner atmosphere
  v /= steps;
  v *= 0.25;
  w += v;

  // colorize
  col = vec3(w*color.r, w*color.g, w*color.b);

  gl_FragColor = vec4(col, v);
}
