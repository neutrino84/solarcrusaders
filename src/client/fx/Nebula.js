
var pixi = require('pixi'),
    engine = require('engine'),
    glslify = require('glslify'),
    Shader = require('pixi-gl-core').GLShader;

function Nebula(game, offset) {
  engine.Shader.call(this, game, new pixi.Texture(this.getRepeatTexture('clouds')));

  this._width = 1024;
  this._height = 1024;

  this.offset = offset || 0;

  // this.pivot.set(this._width/2, this._height/2);
};

Nebula.prototype = Object.create(engine.Shader.prototype);
Nebula.prototype.constructor = Nebula;

Nebula.prototype.apply = function(renderer, shader) {
  shader.uniforms.time = this.game.clock.totalElapsedSeconds() + this.offset;
  shader.uniforms.translationMatrix = this.worldTransform.toArray(true);
  // renderer.bindTexture(this._texture, 0);
};

Nebula.prototype.getShader = function(gl) {
  return new Shader(gl,
    glslify(__dirname + '/shaders/planet.vert', 'utf8'),
    glslify(__dirname + '/shaders/nebula.frag', 'utf8')
  );
};

module.exports = Nebula;
