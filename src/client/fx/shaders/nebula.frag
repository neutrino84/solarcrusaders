
precision lowp float;

varying vec2 vTextureCoord;

uniform float time;

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float noise(vec3 v) { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

vec4 map(vec3 p, float rcenter, float radius) {
  float den = smoothstep(1.0, 0.0, rcenter/radius)/radius;

  // invert space 
  p = -1.0 * p / dot(p, p);

  float t = time * 0.5;

  // smoke  
  vec3 q = p - vec3(0.0, 0.1, 0.0) * t;
  float f;
    f  = 0.50000 * noise(q); q = q * 2.02 - vec3(0.0, 1.0, 0.0) * t;
    f += 0.25000 * noise(q); q = q * 2.03 - vec3(0.0, 1.0, 0.0) * t;
    f += 0.12500 * noise(q); q = q * 2.01 - vec3(0.0, 1.0, 0.0) * t;
    f += 0.06250 * noise(q); q = q * 2.02 - vec3(0.0, 1.0, 0.0) * t;
    f += 0.03125 * noise(q);

  den = clamp(den * f, 0.0, 1.0);
  
  vec3 col = mix(vec3(0.8, 0.6, 0.3), vec3(1.4, 3.8, 0.1), den) + 0.05 * sin(p);
  
  return vec4(col, den);
}

vec3 raymarch(vec3 ro, vec3 rd, float sphere, float radius, vec3 center) {
  float t = 0.05;
  vec4 sum = vec4(0.0);

  for(int i=0; i<100; i++) {
    if(sum.a > 0.99) break;

    vec3 pos = ro + rd * (t + sphere);
    float rcenter = length(pos - center);

    if(rcenter > radius) continue;

    vec4 col = map(pos, rcenter, radius);
         col.xyz *= mix(1.6 * vec3(0.6, 0.2, 0.0), vec3(-2.0, -4.0, -4.0), clamp((pos.y - 0.2) / 2.0, 0.0, 1.0));
         col.a *= 0.6;
         col.rgb *= col.a;

    sum = sum + col * (1.0 - sum.a);

    t += 0.05;
  }

  return clamp(sum.xyz, 0.0, 1.0);
}

// sphere intersection
float sphere(vec3 ro, vec3 rd, vec4 sph) {
  vec3 oc = ro - sph.xyz;

  float b = dot(oc, rd);
  float c = dot(oc, oc) - sph.w * sph.w;
  float h = b * b - c;
  
  if(h < 0.0) return -1.0;

  float t = (-b - sqrt(h));

  return t;
}

mat3 setCamera(vec3 ro, vec3 ta, float cr) {
  vec3 cw = normalize(ta-ro);
  vec3 cp = vec3(sin(cr), cos(cr), 0.0);
  vec3 cu = normalize(cross(cw, cp));
  vec3 cv = normalize(cross(cu, cw));
  return mat3(cu, cv, cw);
}

void main(void) {
  vec2 q = vTextureCoord;
  vec2 p = q - vec2(0.5, 0.5);

  // camera
  vec3 ro = 4.8 * normalize(vec3(1.0, 4.0, 1.0));
  vec3 ta = vec3(0.0, 0.0, 0.0);
  mat3 ca = setCamera(ro, ta, 0.0);
  
  // ray
  vec3 rd = ca * normalize(vec3(p.xy, 1.0));

  // raymarch
  vec3 col;
  float r = 2.0;
  vec3 c = vec3(0.0, 0.0, 0.0);
  float s = sphere(ro, rd, vec4(c, r));
  if(s > 0.0) {
    col = raymarch(ro, rd, s, r, c);
  } else {
    col = vec3(0.0, 0.0, 0.0);
  }

  // contrast and vignetting
  col = col * 0.5 + 0.5 * col * col * (3.0 - 2.0 * col);
  // col *= 0.25 + 0.75 * pow( 16.0 * q.x * q.y * (1.0 - q.x) * (1.0 - q.y), 0.1 );
  
  gl_FragColor = vec4(col, (col.r+col.g+col.b)/2.);
}
