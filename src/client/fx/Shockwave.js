
var pixi = require('pixi'),
    engine = require('engine'),
    glslify = require('glslify'),
    Shader = require('pixi-gl-core').GLShader;

function Shockwave(game, space, planet) {
  engine.Shader.call(this, game);

  this.space = space;
  this.planet = planet;

  this._width = 512;
  this._height = 512;
};

Shockwave.prototype = Object.create(engine.Shader.prototype);
Shockwave.prototype.constructor = Shockwave;

Shockwave.prototype.update = function() {
  var renderer = this.game.renderer,
      transform = this.transform,
      spaceTransform = this.transform.worldTransform.clone(),
      planetTransform = this.transform.worldTransform.clone();
  renderer.render(this.space, this.rtexture, true, spaceTransform.invert());
  renderer.render(this.game.world.background, this.rtexture, false);
};

Shockwave.prototype.create = function(space) {
  this.matrix = new pixi.Matrix();
  this.rtexture = pixi.RenderTexture.create(512, 512, pixi.SCALE_MODES.LINEAR);
  this.texture = this.rtexture;
};

Shockwave.prototype.apply = function(renderer, shader) {
  shader.uniforms.center = [0.5, 0.5];
  shader.uniforms.params = [0.05, 50.0, 10.0];

  shader.uniforms.time = this.game.clock.totalElapsedSeconds();
  shader.uniforms.translationMatrix = this.worldTransform.toArray(true);

  renderer.bindTexture(this._texture, 0);
};

Shockwave.prototype.getShader = function(gl) {
  var shader = new Shader(gl,
        glslify(__dirname + '/shaders/planet.vert', 'utf8'),
        glslify(__dirname + '/shaders/shockwave.frag', 'utf8')
      );
      
  return shader;
};

module.exports = Shockwave;
