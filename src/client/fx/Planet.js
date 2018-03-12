
var pixi = require('pixi'),
    engine = require('engine'),
    glslify = require('glslify'),
    Shader = require('pixi-gl-core').GLShader,
    Atmosphere = require('./Atmosphere');

function Planet(game) {
  this.planetTexture = new pixi.Texture(engine.Shader.getRepeatTexture(game, 'planet')),
  this.highlightTexture = new pixi.Texture(engine.Shader.getRepeatTexture(game, 'highlight'));

  engine.Shader.call(this, game, this.planetTexture);

  // create planet atmosphere
  this.atmosphere = new Atmosphere(game, 0.025, 4.0, 1.0, [0.345, 0.71, 1.0]);
  this.atmosphere.cache();
  this.addChild(this.atmosphere);

  this.pivot.set(this.width/2, this.height/2);
  this.scale.set(1.0, 1.0);
  this.position.set(2048/6, 2048/6);
};

Planet.prototype = Object.create(engine.Shader.prototype);
Planet.prototype.constructor = Planet;

Planet.prototype.apply = function(renderer, shader) {
  shader.uniforms.time = this.game.clock.totalElapsedSeconds();
  shader.uniforms.translationMatrix = this.worldTransform.toArray(true);
  shader.uniforms.uSampler = renderer.bindTexture(this.planetTexture, 0);
  shader.uniforms.highlights = renderer.bindTexture(this.highlightTexture, 1);
};

Planet.prototype.getShader = function(gl) {
  return new Shader(gl,
    glslify(__dirname + '/shaders/planet.vert', 'utf8'),
    glslify(__dirname + '/shaders/planet.frag', 'utf8')
  );
};

module.exports = Planet;
