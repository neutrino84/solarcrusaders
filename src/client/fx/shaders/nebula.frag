
precision lowp float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float time;
uniform vec3 color;

#define pi 3.14159265
#define R(p, a) p=cos(a)*p+sin(a)*vec2(p.y, -p.x)

float Sphere(vec3 p, float r) {
  return length(p)-r;
}

const float nudge = 4.0; // size of perpendicular vector
float normalizer = 1.0 / sqrt(1.0 + nudge*nudge); // pythagorean theorem on that perpendicular to maintain scale
float SpiralNoiseC(vec3 p) {
  float n = -mod(time * 0.2, -2.0); // noise amount
  float iter = 2.0;
  for (int i = 0; i < 8; i++) {
    
    // add sin and cos scaled inverse with the frequency
    n += -abs(sin(p.y*iter) + cos(p.x*iter)) / iter;  // abs for a ridged look

    // rotate by adding perpendicular and scaling down
    p.xy += vec2(p.y, -p.x) * nudge;
    p.xy *= normalizer;

    // rotate on other axis
    p.xz += vec2(p.z, -p.x) * nudge;
    p.xz *= normalizer;

    // increase the frequency
    iter *= 1.733733;
  }
  return n;
}

float VolumetricExplosion(vec3 p) {
  float final = Sphere(p, 4.0);
        final += SpiralNoiseC(p.zxy * 0.4132+333.) * 3.0; //1.25;
  return final;
}

float map(vec3 p)  {
  R(p.xz, 0.008*pi);
  float VolExplosion = VolumetricExplosion(p/0.5) * 0.5;
  return VolExplosion;
}

// assign color to the media
vec3 computeColor(float density, float radius) {
  // color added to the media
  vec3 colCenter = 7.*vec3(0.8, 1.0, 1.0);
  vec3 colEdge = 1.5*vec3(0.48, 0.53, 0.5);

  // color based on density alone, gives impression of occlusion within
  // the media
  vec3 result = mix(vec3(1.0, 0.9, 0.8), vec3(0.4, 0.15, 0.1), density);  
       result *= mix(colCenter, colEdge, min((radius+.05)/.9, 1.15 ));

  return result;
}

bool RaySphereIntersect(vec3 org, vec3 dir, out float near, out float far) {
  float b = dot(dir, org);
  float c = dot(org, org) - 8.0;
  float delta = b*b - c;
  if(delta < 0.0) {
    return false;
  }
  float deltasqrt = sqrt(delta);
  near = -b - deltasqrt;
  far = -b + deltasqrt;
  return far > 0.0;
}

void main(void) {
  const float KEY_1 = 49.0/256.0;
  const float KEY_2 = 50.0/256.0;
  const float KEY_3 = 51.0/256.0;

  float key = 0.0;
        key += texture2D(uSampler, vec2(KEY_1, 0.25)).x;
        key += texture2D(uSampler, vec2(KEY_2, 0.25)).x;
        key += texture2D(uSampler, vec2(KEY_3, 0.25)).x;

  // rd: direction of the ray
  // ro: ray origin
  vec3 rd = normalize(vec3(vTextureCoord - vec2(0.5, 0.5), 1.0));
  vec3 ro = vec3(0.0, 0.0, -4.0 + key);
    
  // ld, td: local, total density 
  // w: weighting factor
  float ld=0.0,
        td=0.0,
        w=0.0;

  // t: length of the ray
  // d: distance function
  float d=1.0,
        t=0.0;
    
  const float h = 0.0;
  vec4 sum = vec4(0.0);
   
  float min_dist=0.0,
        max_dist=0.0;

  if(RaySphereIntersect(ro, rd, min_dist, max_dist)) {
    t = min_dist*step(t, min_dist);
     
    // raymarch loop
    for(int i=0; i<86; i++) {
     
      vec3 pos = ro + t * rd;
    
      // Loop break conditions.
      if(td>0.9 || d<0.12*t || t>10. || sum.a > 0.99 || t>max_dist)
        break;
          
      // evaluate distance function
      float d = map(pos);
            d = abs(d)+0.06;

            // change this string to control density 
            d = max(d, 0.02);
          
      // point light calculations
      vec3 ldst = vec3(0.0)-pos;
      float lDist = max(length(ldst), 0.001);

      // the color of light 
      vec3 lightColor = color;//vec3(0.54, 0.72, 1.0);
           sum.rgb += (lightColor / exp(lDist * lDist * lDist * 0.44) / 62.0); // bloom
          
      if(d<h) {
        // compute local density 
        ld = h - d;
              
        // compute weighting factor 
        w = (1.0 - td) * ld;
       
        // accumulate density
        td += w + 1.0/200.0;
      
        vec4 col = vec4(computeColor(td, lDist), td);
             // emission
             sum += sum.a * vec4(sum.rgb, 0.0) * 0.2 / lDist;  
              
        // uniform scale density
        col.a *= 0.2;

        // colour by alpha
        col.rgb *= col.a;

        // alpha blend in contribution
        sum = sum + col*(1.0 - sum.a);  
      }
        
      td += 1.0/70.0;

      // trying to optimize step size
      t += max(d * 0.08 * max(min(length(ldst),d), 2.0), 0.01);
    }

    // simple scattering
    sum *= 1.0 / exp(ld * 0.2) * 0.8;
    sum = clamp(sum, 0.0, 1.0);
    sum.xyz = sum.xyz*sum.xyz*(3.0-2.0*sum.xyz);
  }

  gl_FragColor = vec4(sum.xyz, sum.a * 2.6);
}
