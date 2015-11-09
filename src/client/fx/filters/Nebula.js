define('fx/filters/nebula', ['phaser'],
  function(Phaser) {
    var Nebula =
      function(game) {
        Phaser.Filter.call(this, game);

        this.fragmentSrc = [
          'precision mediump float;',

          'uniform float time;',
          'uniform vec2 resolution;',
          'uniform vec2 mouse;',

          'float rand(vec2 n) {',
            'return fract(cos(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);',
          '}',

          'float noise(vec2 n) {',
            'const vec2 d = vec2(0.0, 1.0);',
            'vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));',
            'return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);',
          '}',

          'float fbm(vec2 n) {',
            'float total = 0.0, amplitude = 1.0;',
            'for (int i = 0; i < 7; i++) {',
              'total += noise(n) * amplitude;',
              'n += n;',
              'amplitude *= 0.5;',
            '}',
            'return total;',
          '}',

          'vec3 nebula() {',
            'float ntime = time;',

            'const vec3 c1 = vec3(0.1, 0.1, 3.9);',
            'const vec3 c2 = vec3(0.0, 0.0, 0.0);',
            'const vec3 c3 = vec3(0.2, 0.1, 0.55);',
            'const vec3 c4 = vec3(0.52, 0.2, 0.2);',
            'const vec3 c5 = vec3(0.0);',
            'const vec3 c6 = vec3(0.98);',
            
            'vec2 pos = (gl_FragCoord.xy * 2.0) / resolution.xx;',
            
            'float q = fbm(pos - ntime * 0.1);',
            //'vec2 rando = vec2(fbm(pos + q + ntime * 0.7 - pos.x - pos.y), fbm(pos + q - ntime * 0.4));',
            'return mix(c1, c2, fbm(pos + q));', //+ rando));', // + mix(c3, c4, rando.x) - mix(c5, c6, rando.y);',
          '}',

          'void main() {',

            'const float blur = 2.5;',
            'const vec3 alpha = vec3(0.0, 0.0, 0.0);',

            'vec3 visible = nebula();', //vec3(1., 1., 1.);',

            'float aspectRatio = resolution.x / resolution.y;',
          
            'vec2 p = 2.0 * gl_FragCoord.xy / resolution.y - vec2(aspectRatio, 1.0);',
            'vec2 uv = 1.0 * p;',
            
            'float time = time * 0.05;',
            'float distSqr = dot(uv, uv);',
            'float vignette = 1.0 - distSqr;',
            'float angle = atan(p.y, p.x);',
            'float shear = sqrt(distSqr * 0.1);',
            'float stripes = smoothstep(-blur, blur, cos(2.0 * angle + 12.0 * time - 12.0 * shear));',  

            'gl_FragColor = vec4(vec3(vignette * mix(visible, alpha, stripes)), 0.);',
          '}'
        ];
      };

    Nebula.prototype = Object.create(
      Phaser.Filter.prototype
    );

    return Nebula;
  }
);
