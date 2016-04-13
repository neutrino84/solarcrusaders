precision lowp float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float time;

const float pi = 3.14159265359;
const float frequency = 0.25;

void main(void) {
  vec2 coord = vTextureCoord / 0.75;
  float t = 2. * pi * frequency * time;
  float t1 = 0.3 * sin(t) + 0.6;
  float t2 = 0.3 * cos(t) + 0.6;
  vec3 layer1 = texture2D(uSampler, coord).rgb * t1;
       layer1 += texture2D(uSampler, coord).rgb * t2;
  gl_FragColor = vec4(layer1, 0.0);
}