
var pixi = require('pixi'),
    engine = require('engine'),
    glslify = require('glslify'),
    Shader = require('pixi-gl-core').GLShader;

function Atmosphere(game, dist, glow, offset, color) {
  engine.Shader.call(this, game, new pixi.Texture(engine.Shader.getRepeatTexture(game, 'planet')));

  this.dist = dist;
  this.glow = glow;
  this.offset = offset;
  this.color = color || [1.0, 1.0, 1.0];
};

Atmosphere.prototype = Object.create(engine.Shader.prototype);
Atmosphere.prototype.constructor = Atmosphere;

Atmosphere.prototype.getShader = function(gl) {
  return new Shader(gl,
    glslify(__dirname + '/shaders/planet.vert', 'utf8'),
    glslify(__dirname + '/shaders/atmosphere.frag', 'utf8')
  );
};

Atmosphere.prototype.apply = function(renderer, shader) {
  shader.uniforms.translationMatrix = this.worldTransform.toArray(true);
  shader.uniforms.uSampler = renderer.bindTexture(this.texture, 0);
  shader.uniforms.dist = this.dist;
  shader.uniforms.glow = this.glow;
  shader.uniforms.offset = this.offset;
  shader.uniforms.color = this.color;
};

module.exports = Atmosphere;
