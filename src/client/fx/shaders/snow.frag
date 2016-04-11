
precision lowp float;

varying vec2 vTextureCoord;

uniform float time;

const int layers = 2;
const float depth = 0.75;
const mat3 p = mat3(13.323122, 23.5112, 21.71123, 21.1212, 28.7312, 11.9312, 21.8112, 14.7212, 61.3934);
const float pi = 3.1416;

void main(void) {
  vec3 color = vec3(0.0, 0.0, 0.0);

  for(int i=0; i<layers; i++) {
    float fi = float(i) + 1.;
    vec2 q = vTextureCoord * (1. + fi * depth);
         q += vec2((1.0 + fi * depth) * q.x, (1.0 + fi * depth) * q.y);

    vec3 n = vec3(floor(q), 31.189 + fi);
    vec3 m = floor(n) * 0.00001 + fract(n);
    vec3 mp = (31415.9 + m) / fract(p * m);
    vec3 r = fract(mp);
    vec2 s = abs(mod(q, 1.) - 0.5 + 0.9 * r.xy - 0.45);
         s += 0.01 * abs(2. * fract(10. * q.yx) - 1.); 

    float d = 1.5 * max(s.x - s.y, s.x + s.y) + max(s.x, s.y) - 0.01;
    float edge = 0.005 + 0.05 * min(0.5 * abs(fi - 5.0), 1.);
    
    color += vec3(smoothstep(edge, -edge, d)) * (0.5 + sin(time + (fi * pi)));
  }

  // output
  gl_FragColor = vec4(color, 0.0);
}
