
var pixi = require('pixi');

function WireframeShader(shaderManager) {
  pixi.Shader.call(this,
    shaderManager, [
      'attribute vec2 aVertexPosition;',
      'attribute vec4 aColor;',

      'uniform mat3 translationMatrix;',
      'uniform mat3 projectionMatrix;',
      'uniform float alpha;',

      'varying vec4 vColor;',

      'void main(void) {',
      '   gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
      '   vColor = aColor * alpha;',
      '}'
    ].join('\n'), [
      'precision mediump float;',
      'varying vec4 vColor;',

      'void main(void) {',
      '   gl_FragColor = vColor;',
      '}'
    ].join('\n'), {
      alpha:  { type: '1f', value: 0 },
      translationMatrix: { type: 'mat3', value: new Float32Array(9) },
      projectionMatrix: { type: 'mat3', value: new Float32Array(9) }
    }, {
      aVertexPosition:0,
      aColor:0
    }
  );
};

WireframeShader.prototype = Object.create(pixi.Shader.prototype);
WireframeShader.prototype.constructor = WireframeShader;

module.exports = WireframeShader;
