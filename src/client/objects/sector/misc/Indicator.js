
var engine = require('engine');

function Indicator(game) {
  engine.Sprite.call(this, game, 'texture-atlas', 'icon-target.png');

  this.tint = 0x336699;
  this.blendMode = engine.BlendMode.ADD;
  this.pivot.set(20, 20);
  this.renderable = false;

  this.tween = this.game.tweens.create(this);
  this.tween.to({ alpha: 0.0, rotation: 2*global.Math.PI/3 }, 500, engine.Easing.Quadratic.Out);
  this.tween.on('complete', function(tween) {
    tween.target.renderable = false;
  });
};

Indicator.prototype = Object.create(engine.Sprite.prototype);
Indicator.prototype.constructor = Indicator;

Indicator.prototype.show = function(destination) {
  var scale = this.game.world.scale.x;

  // show icon
  this.tween.isRunning && this.tween.stop();
  this.position.copy(destination);
  this.scale.set(1/scale, 1/scale);
  this.renderable = true;
  this.alpha = 1.0;
  this.rotation = 0;
  this.tween.start();
};

module.exports = Indicator;
