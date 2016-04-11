
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

  // vec4 sunlightColor = vec4(1.0,0.91,0.75, 1.0);
  // float sunlightStrength = 5.0;

  vec2 tapPoint = vec2(center.x, center.y);
  vec2 uv = vTextureCoord;
  float modifiedTime = time * waveSpeed;
  float aspectRatio = 1.0;
  vec2 distVec = uv - tapPoint;
  distVec.x *= aspectRatio;
  float d = length(distVec);
  vec2 newTexCoord = uv;

  float multiplier = (d < 1.0) ? ((d-1.0)*(d-1.0)) : 0.0;

  float addend = (sin(frequency*d-modifiedTime)+1.0) * waveStrength * multiplier;

  newTexCoord += addend;

  // vec4 colorToAdd = sunlightColor * sunlightStrength * addend;

  gl_FragColor = texture2D(uSampler, newTexCoord);// + colorToAdd;
}
