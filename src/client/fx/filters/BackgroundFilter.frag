
precision lowp float;

uniform sampler2D channel0;

uniform float scale;
uniform float time;
uniform vec2 resolution;
uniform vec2 transform;

// varying vec2 vTextureCoord;
// varying vec4 vColor;
// uniform sampler2D uSampler;
// void main(void) {
//   vec4 color = vec4(0.25, 0.5, 0.75, 1.);
//   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor + color;
// };

// "const vec3 c1 = vec3(0.0, 0.0, 0.1);",
// "const vec3 c2 = vec3(0.45, 0.35, 0.4);",
// "const vec3 c3 = vec3(0.2, 0.0, 0.0);",
// "const vec3 c4 = vec3(0.2, 0.2, 0.2);",
// "const vec3 c5 = vec3(0.1);",
// "const vec3 c6 = vec3(0.9);",

// nebula settings
const int niterations = 6;
const vec3 c1 = vec3(0.0, 0.0, 0.2);
const vec3 c2 = vec3(0.2, 0.2, 0.3);
const vec3 c3 = vec3(0.3, 0.0, 0.0);
const vec3 c4 = vec3(0.0, 0.2, 0.22);
const vec3 c5 = vec3(0.22);
const vec3 c6 = vec3(0.44);
//.. blue ^

// const int niterations = 5;
// const vec3 c1 = vec3(0.0, 0.0, 0.2);
// const vec3 c2 = vec3(0.2, 0.1, 0.1);
// const vec3 c3 = vec3(0.2, 0.0, 0.1);
// const vec3 c4 = vec3(0.24, 0.1, 0.1);
// const vec3 c5 = vec3(0.00);
// const vec3 c6 = vec3(0.32);
//.. red ^

float rand(vec2 n) {
  return fract(sin(dot(n.xy, vec2(12.9898,78.233))) * 43758.5453);
}

float noise(vec2 n) {
  const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
  return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

float fbm(vec2 n) {
  float total = 0.0, amplitude = 1.0;
  for(int i = 0; i < niterations; i++) {
    total += noise(n) * amplitude;
    n += n;
    amplitude *= 0.5;
  }
  return total;
}

// const int iterations = 4;
// const float formuparam = 0.801;

// const int volsteps = 3;
// const float stepsize = 0.1;

// const float brightness = 0.04;
// const float distfading = 1.0; //0.2;
// const float saturation = 0.8;

// vec3 starnest(vec2 position) {
//   float s = 0.1, fade = 1.0;

//   vec3 dir = vec3(position, 1.);
//   vec3 from = vec3(1.0, 1.0, 1.0);
//        from += vec3(-transform * 0.00003, -2.0);

//   vec3 v = vec3(0.0);
//   for(int r=0; r<volsteps; r++) {
//     vec3 p = from + s * dir;

//     float pa, a = pa = 0.0;
//     float n = noise(p.xy);
    
//     for(int i=0; i<iterations; i++) {
//       p = abs(p)/dot(p,p)-formuparam; // the magic formula
//       a += abs(length(p)-pa); // absolute sum of average change
//       pa = length(p);
//     }
        
//     a *= a*a; // add contrast
//     //v += fade;
//     v += vec3(s, s/2., s/3.) * a * (brightness * pow(n, 3.)); // * fade; // coloring based on distance
//     //fade *= distfading; // distance fading
//     s += stepsize;
//   }
  
//   return mix(vec3(length(v)), v, saturation);
// }

vec3 nebula(vec2 position) {
  float ntime = time * 0.01;
  float q = fbm(position - ntime);
  vec2 r = vec2(fbm(position + q + ntime * 3.6 - position.x - position.y), fbm(position + q - ntime * 0.4));
  return mix(c1, c2, fbm(position + r)) + mix(c3, c4, r.x) - mix(c5, c6, r.y);
}

void main(void) {
  // zoom control
  float s = 1. / (scale * 10.) + 0.75;
  vec2 pos = (-resolution.xy + 2. * (gl_FragCoord.xy)) / resolution.y;
  vec2 position1 = (0.25 * s) * pos - (transform.xy / 48000.);  
  vec2 position2 = (1.0 * s) * pos - (transform.xy / 6000.);

  vec3 color = vec3(0.0, 0.0, 0.0);

  // create starfield
  // color += vec3(starfield(position1)) * 2.0;
  color += texture2D(channel0, position1).rgb;

  // starnest
  // color += starnest(position2) * 0.005;
  
  // create nebula
  color += nebula(position2) * 2.;

  // output
  gl_FragColor = vec4(color, 1.);
}
