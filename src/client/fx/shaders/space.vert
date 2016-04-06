precision lowp float;

attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;

uniform mat3 projectionMatrix;

uniform vec4 uTransform;
varying vec2 vTextureCoord1;
varying vec2 vTextureCoord2;
varying vec4 vColor;

void main(void) {
  gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    
  vec2 coord1 = aTextureCoord;
       coord1 -= uTransform.xy;
       coord1 /= uTransform.zw;

  vec2 coord2 = aTextureCoord;
       coord2 -= uTransform.xy * 1.25 - 0.125;
       coord2 /= uTransform.zw * 1.25;

  vTextureCoord1 = coord1;
  vTextureCoord2 = coord2;

  vColor = vec4(aColor.rgb * aColor.a, aColor.a);
}