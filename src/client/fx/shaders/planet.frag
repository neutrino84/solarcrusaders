precision lowp float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D highlights;

uniform float time;

void main(void) {
  vec2 uv = vTextureCoord - vec2(0.5, 0.5);

  vec3 ro = vec3(0.0, 0.0, 2.5);
  vec3 rd = normalize(vec3(uv, -1.0));
  vec3 color = vec3(0.0);
  vec3 planet = vec3(0.0);
  vec3 highlight = vec3(0.0);

  float alpha = 0.0;
  float b = dot(ro, rd);
  float c = dot(ro, ro) - 1.0;
  float h = b * b - c;

  if(h > 0.0) {
    float t = -b - sqrt(h);
    vec3 pos = ro + t * rd;

    vec2 uv;
         uv.x = atan(pos.x, pos.z) - (0.014 * time);
         uv.y = acos(pos.y);

    planet = texture2D(uSampler, uv).rgb;
    planet *= pow(dot(pos, normalize(vec3(1.0, 0.0, 1.0))), 2.0);

    highlight = texture2D(highlights, uv).rgb;

    color = planet * (highlight + 1.0);

    alpha = 1.0;
  }

  gl_FragColor = vec4(color, alpha);
}
