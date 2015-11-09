precision lowp float;

varying vec2 vTextureCoord;

// rendering params
const float sphsize = 0.8; // planet size
const float dist = 0.06; // distance for glow and distortion
const float glow = 3.2; // glow amount, mainly on hit side

const float start = 120.0;
const float steps = 292.0; // number of steps for the volumetric rendering
const float stepsize = 0.01;

float wind(vec3 p) {
  float d = max(0.0, dist - max(0.0, length(p) - sphsize) / sphsize) / dist; // for distortion and glow area
  float x = max(0.84, p.x * 3.); // to increase glow on left side
  return length(p) * (d * glow * x)+ d * glow * x; // return the result with glow applied
}

void main() {
  vec2 uv = vTextureCoord - vec2(0.5, 0.5);
  vec3 dir = vec3(uv, 1.0);
  vec3 from = vec3(0., 0., -2.);
  vec3 col = vec3(0.0, 0.0, 0.0);
  
  float v = 0.0;
  for(float r=start; r<steps; r++) {
    vec3 p = from + r * dir * stepsize;
    if(length(p)-sphsize > 0.0) {
      v += wind(p);
    } else {
      v += min(1.0, wind(p));
    }
  }

  // average values and
  // apply bright factor
  v /= steps;
  v *= pow(v, 1.8);

  // green - vec3(v/4.2, v/1.8, v/3.2);
  // red - vec3(v/1.2, v/3.6, v/3.6);
  // blue - vec3(v/4., v/3., v/0.8);
  col += vec3(v/4., v/3., v/0.8);

  gl_FragColor = vec4(col, 0.); 
}
