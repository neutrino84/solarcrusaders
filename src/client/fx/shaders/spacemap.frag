precision lowp float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;


vec4 checkCenter(vec3 col, float h, float a){

    float r = sign(h - 0.9995);
    col.g = max(col.g, max(0.0, r));
    a = max(a, max(0.0, r));

    return vec4(col, a);
}


void main(void) {
  vec2 uv = vTextureCoord - vec2(0.5, 0.5);
  vec3 ro = vec3(0.0, 0.0, 2.25);
  vec3 rd = normalize(vec3(uv, -1.0));
  vec3 color = vec3(0.0, 0.0, 0.0);

  float b = dot(ro, rd);
  float c = dot(ro, ro) - 1.0;
  float h = b * b - c;

  float alpha = min(0.8, max(0.0, sign(h)));
  vec4 d = checkCenter(color, h, alpha);
  color = d.xyz;
  alpha = d.w;


  gl_FragColor = vec4(color, alpha);
}

