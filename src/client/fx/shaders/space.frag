precision lowp float;

varying vec2 vTextureCoord1;
varying vec2 vTextureCoord2;

uniform sampler2D uSampler;
uniform sampler2D uMapSampler;

void main(void) {
  vec3 layer1 = texture2D(uSampler, vTextureCoord1).rgb;
       layer1 += texture2D(uMapSampler, vTextureCoord2).rgb;
  gl_FragColor = vec4(layer1, 1.0);
}