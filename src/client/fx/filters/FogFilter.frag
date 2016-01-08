
precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float scale;
uniform vec2 resolution;

void main(void) {
  float m = scale / 2. + 0.35;
  vec4 tex = texture2D(uSampler, vTextureCoord);
  vec3 color = mix(vec3(0. * tex.a, 0.2 * tex.a, 0.6 * tex.a), tex.rgb, min(m, 0.8));
  gl_FragColor = vec4(color, tex.a);
}
