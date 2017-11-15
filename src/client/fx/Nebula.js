
var pixi = require('pixi'),
    engine = require('engine'),
    glslify = require('glslify'),
    Shader = require('pixi-gl-core').GLShader;

function Nebula(game, offset, color) {
  engine.Shader.call(this, game, new pixi.Texture(engine.Shader.getRepeatTexture(game, 'clouds')));

  this.offset = offset || 1.0;
  this.color = color || [0.54, 0.72, 1.0];
};

Nebula.prototype = Object.create(engine.Shader.prototype);
Nebula.prototype.constructor = Nebula;

Nebula.prototype.apply = function(renderer, shader) {
  shader.uniforms.translationMatrix = this.worldTransform.toArray(true);
  shader.uniforms.time = this.game.clock.totalElapsedSeconds() + this.offset;
  shader.uniforms.color = this.color;
};

Nebula.prototype.getShader = function(gl) {
  return new Shader(gl,
    glslify(__dirname + '/shaders/planet.vert', 'utf8'),
    glslify(__dirname + '/shaders/nebula.frag', 'utf8')
  );
};

module.exports = Nebula;
