
var pixi = require('pixi'),
    engine = require('engine'),
    glslify = require('glslify'),
    Shader = require('pixi-gl-core').GLShader;

function Shockwave(game, width, height) {
  engine.Shader.call(this, game);

  this.tween = game.tweens.create(this);
  this.texture = pixi.RenderTexture.create(width, height, pixi.SCALE_MODES.LINEAR);

  this.pivot.set(width/2, height/2);

  this.width = width;
  this.height = height;
};

Shockwave.prototype = Object.create(engine.Shader.prototype);
Shockwave.prototype.constructor = Shockwave;

Shockwave.prototype.preRender = function() {
  var renderer = this.game.renderer,
      transform = this.transform,
      position = this.position,
      worldTransform;

  position.set(this.properties.position.x, this.properties.position.y);
      
  worldTransform = this.transform.worldTransform.clone();

  renderer.render(this.game.world.static, this.texture, true, worldTransform.invert());
  renderer.render(this.game.world.background, this.texture, false);
  renderer.render(this.game.world.foreground, this.texture, false);
};

Shockwave.prototype.start = function(properties) {
  this.properties = properties;

  var easing = properties.easing || engine.Easing.Quadratic.Out,
      animation = { strength: 0.0 };
  this.tween.to(animation, properties.duration || 1024, easing, true, 0, 0, false);
  this.tween.once('complete', function() {
    this.parent.remove(this);
    this.destroy(true);
  }, this);
};

Shockwave.prototype.apply = function(renderer, shader) {
  shader.uniforms.time = this.tween.timeline[0].percent;
  shader.uniforms.translationMatrix = this.worldTransform.toArray(true);

  shader.uniforms.uSampler = renderer.bindTexture(this.texture, 0);
};

Shockwave.prototype.getShader = function(gl) {
  return new Shader(gl,
    glslify(__dirname + '/shaders/planet.vert', 'utf8'),
    glslify(__dirname + '/shaders/shockwave.frag', 'utf8')
  );
};

module.exports = Shockwave;
