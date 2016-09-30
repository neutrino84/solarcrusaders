precision lowp float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;

uniform float time;

void main(void) {
  vec2 uv = vTextureCoord - vec2(0.5, 0.5);
  vec3 ro = vec3(0.0, 0.0, 2.5);
  vec3 rd = normalize(vec3(uv, -1.0));
  vec3 color = vec3(0.0, 0.0, 0.0);

  float alpha = 0.0;
  float b = dot(ro, rd);
  float c = dot(ro, ro) - 1.0;
  float h = b * b - c;

  if(h > 0.0) {
    alpha += 1.0;
    if(h > 0.03){
        color = texture2D(uSampler, uv).rgb;
        alpha = 0.9;
    }
  }

  gl_FragColor = vec4(color, alpha);
}
