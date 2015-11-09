
var pixi = require('pixi');
var fs = require('fs');

function PlanetShader(game) {
  this.game = game;

  var uniforms = {
    time: { type: 'f', value: 0 },
    channel0: { type: 'sampler2D', value: 0 },
    channel1: { type: 'sampler2D', value: 0 },
    projectionMatrix: { type: 'mat3', value: new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]) }
  }

  var vertex = fs.readFileSync(__dirname + '/PlanetShader.vert', 'utf8');
  var fragment = fs.readFileSync(__dirname + '/PlanetShader.frag', 'utf8');

  pixi.Shader.call(this, game.renderer.shaderManager, vertex, fragment, uniforms, {
    aVertexPosition: 0,
    aTextureCoord: 0,
    aColor: 0
  });
}

PlanetShader.prototype = Object.create(pixi.Shader.prototype);
PlanetShader.prototype.constructor = PlanetShader;

PlanetShader.prototype.setTexture = function(texture0, texture1) {
  this.uniforms.channel0.value = texture0;
  this.uniforms.channel1.value = texture1;
},

PlanetShader.prototype.update = function() {
  this.uniforms.time.value = this.game.clock.totalElapsedSeconds();
};

module.exports = PlanetShader;
