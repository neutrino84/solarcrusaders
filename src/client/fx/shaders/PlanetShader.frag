precision lowp float;

uniform sampler2D channel0;
uniform sampler2D channel1;

uniform float time;
varying vec2 vTextureCoord;

void main() {
  vec2 uv = vTextureCoord - vec2(0.5, 0.5);
  vec3 ro = vec3(0.0, 0.0, 2.5);
  vec3 rd = normalize(vec3(uv, -1.0));
  vec3 col = vec3(0.0, 0.0, 0.0);
  vec3 clouds = vec3(0.0, 0.0, 0.0);

  // intersect sphere
  float alpha = 0.0;
  float b = dot(ro, rd);
  float c = dot(ro, ro) - 1.0;
  float h = b * b - c;

  if(h > 0.0) {
    float t = -b - sqrt(h);
    vec3 pos = ro + t * rd;
    vec3 nor = pos;

    // texture mapping
    vec2 uv;
         uv.x = atan(nor.x, nor.z) / .7853 - 0.01 * time;
         uv.y = acos(nor.y) / .7853;
    
    col = texture2D(channel0, uv).rgb;
    col *= 0.12 + 1.0 * pow(max(0.5, dot(pos, normalize(vec3(2., 0.0, 4.)))), 8.);

    uv.x -= 0.016 * time;

    clouds += texture2D(channel1, uv).rgb;
    clouds *= 0.05 + 0.2 * pow(max(0.0, dot(pos, normalize(vec3(2., 0.0, 4.)))), 2.);
    col += clouds;

    // alpha
    alpha += 1.0;
  }

  // contrast
  col = (col - 0.5) * 1.08 + 0.5;
  
  gl_FragColor = vec4(col, alpha); 
}
