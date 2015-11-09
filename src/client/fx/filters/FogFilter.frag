
precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float scale;
uniform vec2 resolution;

void main(void) {
  float m = scale * 2. - 1.;
  vec4 tex = texture2D(uSampler, vTextureCoord);
  vec4 color = vec4(tex.r * 0.75, tex.g * 0.75, tex.b, tex.a);
  gl_FragColor = mix(color, tex, max(m, 0.25));
}
