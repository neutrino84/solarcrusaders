precision lowp float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float alpha;

void main(void) {
  vec2 coord = vTextureCoord * 2.0;
  vec3 layer1 = texture2D(uSampler, coord).rgb;
  
  gl_FragColor = vec4(layer1 * alpha * 8.0, 0.0);
}