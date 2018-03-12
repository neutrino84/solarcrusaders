precision lowp float;

varying vec2 vTextureCoord;
varying vec2 vTextureCoord2;

uniform sampler2D uSampler;
uniform float alpha;

void main(void) {
  vec2 p = vTextureCoord * 0.5;
  vec3 tex = texture2D(uSampler, p).rgb;
  
  gl_FragColor = vec4(tex * alpha, 0.0);
}