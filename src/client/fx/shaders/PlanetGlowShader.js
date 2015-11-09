
var pixi = require('pixi');
var fs = require('fs');

function PlanetGlowShader(game) {
  this.game = game;

  var uniforms = {
    projectionMatrix: { type: 'mat3', value: new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]) }
  }

  var vertex = fs.readFileSync(__dirname + '/PlanetShader.vert', 'utf8');
  var fragment = fs.readFileSync(__dirname + '/PlanetGlowShader.frag', 'utf8');

  pixi.Shader.call(this, game.renderer.shaderManager, vertex, fragment, uniforms, {
    aVertexPosition: 0,
    aTextureCoord: 0,
    aColor: 0
  });
}

PlanetGlowShader.prototype = Object.create(pixi.Shader.prototype);
PlanetGlowShader.prototype.constructor = PlanetGlowShader;

module.exports = PlanetGlowShader;
