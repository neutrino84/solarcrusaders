
var Shader = require('pixi-gl-core').GLShader;

function WireframeShader(gl) {
  Shader.call(this, gl, [
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
  ].join('\n'));
};

WireframeShader.prototype = Object.create(Shader.prototype);
WireframeShader.prototype.constructor = WireframeShader;

module.exports = WireframeShader;
