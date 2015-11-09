define('fx/filters/nebula', ['phaser'],
  function(Phaser) {
    var Nebula =
      function(game) {
        Phaser.Filter.call(this, game);

        /*
        #define time iGlobalTime*0.2

        mat2 makem2(in float theta){float c = cos(theta);float s = sin(theta);return mat2(c,-s,s,c);}
        float noise( in vec2 x ){return texture2D(iChannel0, x*.01).x;}

        mat2 m2 = mat2( 0.80,  0.60, -0.60,  0.80 );
        float fbm( in vec2 p )
        { 
          float z=2.;
          float rz = 0.;
          for (float i= 1.;i < 7.;i++ )
          {
            rz+= abs((noise(p)-0.5)*2.)/z;
            z = z*2.;
            p = p*2.;
            p*= m2;
          }
          return rz;
        }

        void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
          vec2 p = fragCoord.xy / iResolution.xy*2.-1.;
          p.x *= iResolution.x/iResolution.y;
          vec2 bp = p;
          #ifndef CENTERED
          p += 5.;
          p *= 0.6;
          #endif
          float rb = fbm(p*.5+time*.17)*.1;
          rb = sqrt(rb);
          #ifndef CENTERED
          p *= makem2(rb*.2+atan(p.y,p.x)*1.);
          #else
          p *= makem2(rb*.2+atan(p.y,p.x)*2.);
          #endif
          
          //coloring
          float rz = fbm(p*.9-time*.7);
          rz *= dot(bp*5.,bp)+.5;
          rz *= sin(p.x*.5+time*4.)*1.5;
          vec3 col = vec3(.04,0.07,0.45)/(.1-rz);
          fragColor = vec4(sqrt(abs(col)),1.0);
        }
        */

        this.fragmentSrc = [
          'precision mediump float;',

          'uniform float time;',
          'uniform vec2 resolution;',
          'uniform vec2 mouse;',

          'uniform sampler2D uSampler;',

          'mat2 m2 = mat2(0.80, 0.60, -0.60, 0.80);',

          'mat2 makem2(in float theta) {',
            'float c = cos(theta);',
            'float s = sin(theta);',
            'return mat2(c,-s,s,c);',
          '}',
          
          'float noise(in vec2 x) {',
            'return fract(cos(dot(x, vec2(12.9898, 4.1414))) * 43758.5453);',
            //'return texture2D(uSampler, x * .01).x;',
          '}',

          'float fbm(in vec2 p) {',
            'float z = 2.;',
            'float rz = 0.;',
            'for(float i= 1.; i < 7.; i++) {',
              'rz += abs((noise(p)-0.5)*2.)/z;',
              'z = z*2.;',
              'p = p*2.;',
              'p *= m2;',
            '}',
            'return rz;',
          '}',

          'vec3 nebula(in vec2 fragCoord) {',
            'vec2 p = fragCoord.xy / resolution.xy*2.-1.;',
            'p.x *= resolution.x / resolution.y;',
            'vec2 bp = p;',

            // #ifndef CENTERED
            // p += 5.;
            // p *= 0.6;
            // #endif

            'float gtime = time * 0.25;',

            'float rb = fbm(p * .5 + gtime * .17) * .1;',
            'rb = sqrt(rb);',

            //'p *= makem2(rb * .2 + atan(p.y, p.x) * 1.);',

            'p *= makem2(rb*.2+atan(p.y,p.x)*2.);',
            
            //coloring
            'float rz = fbm(p * 0.9 - gtime * 0.7);',
            'rz *= dot(bp * 5.0, bp) + 0.5;',
            'rz *= sin(p.x * .5 + gtime * 4.) * 1.5;',
            'vec3 col = vec3(.04 ,0.07 ,0.45) / (.1 - rz);',
            'return vec3(sqrt(abs(col)));',
          '}',

          'void main() {',

            'const float blur = 2.5;',
            'const vec3 alpha = vec3(0.0, 0.0, 0.0);',

            'vec3 visible = nebula(gl_FragCoord.xy);', //vec3(1., 1., 1.);',

            'float aspectRatio = resolution.x / resolution.y;',
          
            'vec2 p = 2.0 * gl_FragCoord.xy / resolution.y - vec2(aspectRatio, 1.0);',
            'vec2 uv = 1.0 * p;',
            
            'float time = time * 0.05;',
            'float distSqr = dot(uv, uv);',
            'float vignette = 1.0 - distSqr;',
            'float angle = atan(p.y, p.x);',
            'float shear = sqrt(distSqr * 0.1);',
            'float stripes = smoothstep(-blur, blur, cos(2.0 * angle + 12.0 * time - 12.0 * shear));',  

            'gl_FragColor = vec4(vec3(vignette * visible), 0.);',
          '}'
        ];
      };

    Nebula.prototype = Object.create(
      Phaser.Filter.prototype
    );

    return Nebula;
  }
);
