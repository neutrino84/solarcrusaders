
var engine = require('engine');

function Indicator(game, parent) {
  engine.Group.call(this, game, parent);

  this.renderable = false;

  this.sprite1 = new engine.Sprite(game, 'texture-atlas', 'icon-target.png');
  this.sprite1.tint = 0x55aaff;
  this.sprite1.pivot.set(20, 20);
  this.sprite1.blendMode = engine.BlendMode.ADD;

  this.sprite2 = new engine.Sprite(game, 'texture-atlas', 'icon-target.png');
  this.sprite2.tint = 0x55aaff;
  this.sprite2.pivot.set(20, 20);
  this.sprite2.scale.set(0.5, 0.5);
  this.sprite2.blendMode = engine.BlendMode.ADD;

  this.tween1 = this.game.tweens.create(this.sprite1);
  this.tween1.to({ alpha: 0.0, rotation: 2 * global.Math.PI / 3 }, 500, engine.Easing.Quadratic.Out);
  
  this.tween2 = this.game.tweens.create(this.sprite2);
  this.tween2.to({ alpha: 0.0, rotation: -2 * global.Math.PI / 6 }, 500, engine.Easing.Quadratic.Out);
  this.tween2.on('complete', function(tween) {
    this.renderable = false;
  }, this);

  this.add(this.sprite1);
  this.add(this.sprite2);
};

Indicator.prototype = Object.create(engine.Group.prototype);
Indicator.prototype.constructor = Indicator;

Indicator.prototype.show = function(destination) {
  var scale = this.game.world.scale.x;

  this.tween1.isRunning && this.tween1.stop();
  this.tween2.isRunning && this.tween2.stop();

  this.position.copy(destination);
  this.scale.set(1/scale, 1/scale);
  this.renderable = true;
  
  this.sprite1.alpha = 1.0;
  this.sprite1.rotation = 0;

  this.sprite2.alpha = 1.0;
  this.sprite2.rotation = 0;

  this.tween1.start();
  this.tween2.start();
};

module.exports = Indicator;
