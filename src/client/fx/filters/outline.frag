precision mediump float;

varying mediump vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec2 texelSize;
uniform float matrix[9];

void main(void) {
  float c11 = texture2D(uSampler, vTextureCoord - texelSize).a; // top left
  float c12 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - texelSize.y)).a; // top center
  float c13 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y - texelSize.y)).a; // top right

  float c21 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y)).a; // mid left
  float c22 = texture2D(uSampler, vTextureCoord).a; // mid center
  float c23 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y)).a; // mid right

  float c31 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y + texelSize.y)).a; // bottom left
  float c32 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + texelSize.y)).a; // bottom center
  float c33 = texture2D(uSampler, vTextureCoord + texelSize).a; // bottom right

  // gl_FragColor =
  float c =
    c11 * matrix[0] + c12 * matrix[1] + c13 * matrix[2] +
    c21 * matrix[3] + c22 * matrix[4] + c23 * matrix[5] +
    c31 * matrix[6] + c32 * matrix[7] + c33 * matrix[8];

  gl_FragColor = vec4(c, c, c, c);
}