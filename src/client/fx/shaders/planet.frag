precision lowp float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uClouds;

uniform float time;

void main(void) {
  vec2 uv = vTextureCoord - vec2(0.5, 0.5);
  vec3 ro = vec3(0.0, 0.0, 2.5);
  vec3 rd = normalize(vec3(uv, -1.0));
  vec3 color = vec3(0.0, 0.0, 0.0);
  vec3 planet = vec3(0.0, 0.0, 0.0);
  vec3 clouds = vec3(0.0, 0.0, 0.0);

  float alpha = 0.0;
  float b = dot(ro, rd);
  float c = dot(ro, ro) - 1.0;
  float h = b * b - c;

  if(h > 0.0) {
    float t = -b - sqrt(h);
    vec3 pos = ro + t * rd;
    vec3 nor = pos;
    vec2 uv;
         uv.x = atan(nor.x, nor.z) / .7853 - 0.04 * time;
         uv.y = acos(nor.y) / .7853;

    planet = texture2D(uSampler, uv).rgb;

    uv.x -= 0.04 * time;
    uv.y -= 0.04 * time;

    clouds = texture2D(uClouds, uv).rgb;
    clouds.b /= 2.6;
    clouds.g /= 2.6;
    // clouds.b /= 0.0;
    
    // textures
    color = mix(planet * planet, planet, 0.5);
    color *= 1.86 * pow(max(0.44, dot(pos, normalize(vec3(2.6, 0.0, 6.0)))), 7.6);
    color += clouds * (clouds / 2.0);// * 0.5;

    alpha += 1.0;
  }

  gl_FragColor = vec4(color, alpha);
}
