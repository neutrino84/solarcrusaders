
precision lowp float;

varying vec2 vTextureCoord1;
varying vec2 vTextureCoord2;
varying vec4 vColor;

uniform sampler2D channel0;
uniform sampler2D uSampler;
uniform vec4 uFrame;
// uniform vec2 uPixelSize;
uniform float time;

void main(void) {
  // vec2 coord = mod(vTextureCoord, uFrame.zw);
  //      coord = clamp(coord, uPixelSize, uFrame.zw - uPixelSize);
  //      coord += uFrame.xy;
  vec3 layer1 = texture2D(uSampler, vTextureCoord1).rgb;
       layer1 += texture2D(channel0, vTextureCoord2).rgb;
  gl_FragColor = vec4(layer1, 1.0) * vColor;
}
