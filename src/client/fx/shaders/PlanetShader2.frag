precision lowp float;

uniform sampler2D channel0;
// uniform sampler2D channel1;

uniform float time;
varying vec2 vTextureCoord;

// rendering params
const float sphsize = 0.8; // planet size
const float dist = 0.06; // distance for glow and distortion
const float perturb = 0.3;// distortion amount of the flow around the planet
const float windspeed = 0.25; // speed of wind flow
const float glow = 3.2; // glow amount, mainly on hit side

const float start = 118.0;
const float steps = 194.0; // number of steps for the volumetric rendering
const float stepsize = 0.01; 
const float brightness = 1.0;

// fractal params
const int iterations = 5;
const float fractparam = 0.53;
const vec3 offset = vec3(0.25, 3.5, 0.25);

float wind(vec3 p) {
  float d = max(0.0, dist - max(0.0, length(p) - sphsize) / sphsize) / dist; // for distortion and glow area
  float x = max(0.6, p.x * -1.8); // to increase glow on left side
  // p -= d * normalize(p) * perturb; // spheric distortion of flow
  // p += vec3(0., 0., -time * windspeed * 2.); // flow movement
  // p = abs(fract((p + offset) * 0.1) - 0.5); // tile folding 
  // for(int i=0; i<iterations; i++) {
  //   p = abs(p) / dot(p,p) - fractparam; // the magic formula for the hot flow
  // }
  return length(p) * (d * glow * x)+ d * glow * x; // return the result with glow applied
}

void main() {
  // get ray dir
  vec2 uv = vTextureCoord - vec2(0.5, 0.5);
  vec3 dir = vec3(uv, 1.0);
  vec3 from = vec3(0., 0., -2.);
  vec3 tex = vec3(0.);

  float ttime = 0.4 * sin(time * 2.) + 0.6;

  // volumetric rendering
  float alpha = 0.0;
  float v = 0.0;
  float l = -0.0001;
  float t = time * windspeed * 0.25;
  
  for(float r=start; r<steps; r++) {
    vec3 p = from + r * dir * stepsize;
    if(length(p)-sphsize > 0.0) {
      v += min(50., wind(p));
    } else if(l < 0.0) {
      alpha += 1.0;
      v *= 2.;
      l = 0.;
      tex += pow(max(.2, dot(normalize(p), normalize(vec3(-0.75, 0.0, -1.75)))), 3.4) *
        (0.0 + texture2D(channel0, uv * vec2(2., 2.) * (1.0 + p.z * 0.5) + vec2(t * 0.25, 0.5)).rgb * 1.25);
    } else {
      v += min(0.6, wind(p));
    }
  }

  // average values and
  // apply bright factor
  v /= steps;
  v *= brightness; 
  v *= pow(v, 1.2);

  // green - vec3(v/4.2, v/1.8, v/3.2);
  // red - vec3(v/1.2, v/3.6, v/3.6);
  // blue - vec3(v/4., v/3., v/0.8);
  vec3 col = vec3(v/4., v/3., v/0.8);
       col += tex;

  gl_FragColor = vec4(col, alpha);
}

