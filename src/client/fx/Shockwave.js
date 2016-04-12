
var pixi = require('pixi'),
    engine = require('engine'),
    glslify = require('glslify'),
    Shader = require('pixi-gl-core').GLShader;

function Shockwave(game, width, height) {
  engine.Shader.call(this, game);

  this.strength = 0.08;
  this.tween = game.tweens.create(this);
  this.matrix = new pixi.Matrix();
  this.texture = pixi.RenderTexture.create(width, height, pixi.SCALE_MODES.LINEAR);

  this._width = width;
  this._height = height;

  this._strength = 0.0;
  this._frequency = 5.0;
  this._speed = 0.5;
};

Shockwave.prototype = Object.create(engine.Shader.prototype);
Shockwave.prototype.constructor = Shockwave;

Shockwave.prototype.preRender = function(space) {
  var renderer = this.game.renderer,
      transform = this.transform,
      spaceTransform = this.transform.worldTransform.clone(),
      planetTransform = this.transform.worldTransform.clone();
  renderer.render(space, this.texture, true, spaceTransform.invert());
  renderer.render(this.game.world.background, this.texture, false);
  renderer.render(this.game.world.foreground, this.texture, false);
};

Shockwave.prototype.start = function(properties) {
  var easing = properties.easing || engine.Easing.Quadratic.InOut,
      animation = {
        _strength: properties.strength || this.strength
      };

  this._frequency = properties.frequency || this._frequency;
  this._speed = properties.speed || this._speed;

  this.tween.to(animation, properties.duration || 3000, easing, true, 0, 0, true);
  this.tween.once('complete', function() {
    this.parent.remove(this);
    this.destroy(true);
  }, this);
};

Shockwave.prototype.apply = function(renderer, shader) {
  shader.uniforms.center = [0.5, 0.5];
  shader.uniforms.params = [this._strength, this._frequency, this._speed];

  shader.uniforms.time = this.game.clock.totalElapsedSeconds();
  shader.uniforms.translationMatrix = this.worldTransform.toArray(true);

  renderer.bindTexture(this._texture, 0);
};

Shockwave.prototype.getShader = function(gl) {
  return new Shader(gl,
    glslify(__dirname + '/shaders/planet.vert', 'utf8'),
    glslify(__dirname + '/shaders/shockwave.frag', 'utf8')
  );
};

module.exports = Shockwave;
