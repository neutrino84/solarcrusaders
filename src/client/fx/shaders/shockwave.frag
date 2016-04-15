precision lowp float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;

uniform float time;
uniform float strength;

float disc(vec2 uv) {
  float radius = time;
  float border = 0.1;// * time + 0.1;
  float d = length(uv) * 2.0;
  float start = smoothstep(radius, radius+border, d);
  float end = smoothstep(radius-border, radius, d);
  float multiplier = (d - 1.0) * (d - 1.0);
  return (1.0-(1.0+start-end)) * multiplier;
}

void main(void) {
  vec2 coord = vTextureCoord;
  vec2 center = vTextureCoord - vec2(0.5, 0.5);

  float d = disc(center) * strength;
  
  coord += d;

  float light = d+d;
  vec3 color = texture2D(uSampler, coord).rgb;
       color.b += light;
       color.g += light/2.;

  gl_FragColor = vec4(color, 1.0);
}