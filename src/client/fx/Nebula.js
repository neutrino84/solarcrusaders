
var pixi = require('pixi'),
    engine = require('engine'),
    glslify = require('glslify'),
    Shader = require('pixi-gl-core').GLShader;

function Nebula(game, offset) {
  engine.Shader.call(this, game, new pixi.Texture(this.getRepeatTexture('clouds')));

  this.offset = offset || 0;
};

Nebula.prototype = Object.create(engine.Shader.prototype);
Nebula.prototype.constructor = Nebula;

Nebula.prototype.apply = function(renderer, shader) {
  shader.uniforms.time = this.game.clock.totalElapsedSeconds() + this.offset;
  shader.uniforms.translationMatrix = this.worldTransform.toArray(true);
};

Nebula.prototype.getShader = function(gl) {
  return new Shader(gl,
    glslify(__dirname + '/shaders/planet.vert', 'utf8'),
    glslify(__dirname + '/shaders/nebula.frag', 'utf8')
  );
};

module.exports = Nebula;
