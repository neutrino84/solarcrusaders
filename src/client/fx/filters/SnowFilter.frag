
precision lowp float;

uniform float scale;
uniform float time;
uniform vec2 resolution;
uniform vec2 transform;

// #define BLIZZARD // Comment this out for a blizzard

// #ifdef LIGHT_SNOW
//   #define LAYERS 50
//   #define DEPTH .5
//   #define WIDTH .3
//   #define SPEED .6
// #else // BLIZZARD
//   #define LAYERS 10
//   #define DEPTH .1
//   #define WIDTH .8
//   #define SPEED 1.5
// #endif

// void mainImage( out vec4 fragColor, in vec2 fragCoord )
// {
//   const mat3 p = mat3(13.323122,23.5112,21.71123,21.1212,28.7312,11.9312,21.8112,14.7212,61.3934);
//   vec2 uv = iMouse.xy/iResolution.xy + vec2(1.,iResolution.y/iResolution.x)*fragCoord.xy / iResolution.xy;
//   vec3 acc = vec3(0.0);
//   float dof = 5.*sin(iGlobalTime*.1);
//   for (int i=0;i<LAYERS;i++) {
//     float fi = float(i);
//     vec2 q = uv*(1.+fi*DEPTH);
//     q += vec2(q.y*(WIDTH*mod(fi*7.238917,1.)-WIDTH*.5),SPEED*iGlobalTime/(1.+fi*DEPTH*.03));
//     vec3 n = vec3(floor(q),31.189+fi);
//     vec3 m = floor(n)*.00001 + fract(n);
//     vec3 mp = (31415.9+m)/fract(p*m);
//     vec3 r = fract(mp);
//     vec2 s = abs(mod(q,1.)-.5+.9*r.xy-.45);
//     s += .01*abs(2.*fract(10.*q.yx)-1.); 
//     float d = .6*max(s.x-s.y,s.x+s.y)+max(s.x,s.y)-.01;
//     float edge = .005+.05*min(.5*abs(fi-5.-dof),1.);
//     acc += vec3(smoothstep(edge,-edge,d)*(r.x/(1.+.02*fi*DEPTH)));
//   }
//   fragColor = vec4(vec3(acc),1.0);
// }

const int layers = 3;
const float depth = 0.8;
const float width = 0.8;
const float speed = 0.0;

void main(void) {
  const mat3 p = mat3(13.323122, 23.5112, 21.71123, 21.1212, 28.7312, 11.9312, 21.8112, 14.7212, 61.3934);

  // zoom control
  float s = (1.0 - scale) + 0.5;
  vec2 pos = (-resolution.xy + 2. * (gl_FragCoord.xy)) / resolution.y;
  vec2 position = (1.0 * s) * pos - (transform.xy / 250.0);
  vec3 color = vec3(0.0, 0.0, 0.0);

  // float dof = 5.0 * sin(time * 0.1);
  for(int i=0; i<layers; i++) {
    float fi = float(i);
    vec2 q = position * (1.0 + fi * depth);
         // q += vec2(q.y * (width * mod(fi * 7.238917, 1.) - width * .5), speed * time / (1. + fi * depth * .03));
         q += vec2((1.0 + fi * depth * .01) * pos.x, (1.0 + fi * depth * .01) * pos.y);

    vec3 n = vec3(floor(q), 31.189 + fi);
    vec3 m = floor(n) * 0.00001 + fract(n);
    vec3 mp = (31415.9 + m) / fract(p * m);
    vec3 r = fract(mp);
    vec2 s = abs(mod(q, 1.) - 0.5 + 0.9 * r.xy - 0.45);
         s += 0.01 * abs(2. * fract(10. * q.yx) - 1.); 

    float d = 1.5 * max(s.x - s.y, s.x + s.y) + max(s.x, s.y) - 0.01;
    float edge = 0.005 + 0.05 * min(0.5 * abs(fi - 5.0/* - dof*/), 1.);
    
    color += vec3(smoothstep(edge, -edge, d) * (r.x / (1.0 + 0.02 * fi * depth)));
  }

  // output
  gl_FragColor = vec4(color, 0.0);
}
