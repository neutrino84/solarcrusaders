precision lowp float;

varying vec2 vTextureCoord1;

uniform sampler2D uSampler;
uniform sampler2D uMapSampler;

void main(void) {
  vec3 tex = texture2D(uSampler, vTextureCoord1).rgb;
  gl_FragColor = vec4(tex, 1.0);
}