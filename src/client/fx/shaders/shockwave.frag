
precision lowp float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;

uniform vec2 center;
uniform vec3 params;
uniform float time;

void main(void) {
  float waveStrength = params.x;
  float frequency = params.y;
  float waveSpeed = params.z; 

  float modifiedTime = time * waveSpeed;

  vec2 tapPoint = vec2(center.x, center.y);
  vec2 uv = vTextureCoord;
  
  vec2 distVec = uv - tapPoint;
  
  float d = length(distVec)*2.0;
  vec2 newTexCoord = uv;

  float multiplier = (d < 1.0) ? ((d-1.0)*(d-1.0)) : 0.0;

  float addend = (sin(frequency*d-modifiedTime)+1.0) * waveStrength * multiplier;

  newTexCoord += addend;

  gl_FragColor = texture2D(uSampler, newTexCoord);
}
