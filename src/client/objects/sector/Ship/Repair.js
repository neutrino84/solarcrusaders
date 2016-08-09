
var engine = require('engine');

function Repair(parent) {
  this.parent = parent;
  this.game = parent.game;
};

Repair.prototype.constructor = Repair;

Repair.prototype.create = function() {
  this.sprite = new engine.Sprite(this.game, 'texture-atlas', this.parent.name + '.png');
  this.sprite.blendMode = engine.BlendMode.ADD;
  this.sprite.tint = 0x00FF00;
};

Repair.prototype.start = function() {
  this.sprite.alpha = 1.0;

  this.tween = this.game.tweens.create(this.sprite);
  this.tween.to({ alpha: 0.5 }, 1000, engine.Easing.Quadratic.InOut);
  this.tween.repeat();
  this.tween.start();

  this.parent.chassis.tint = 0x99FF99;
  this.parent.addChild(this.sprite);
};

Repair.prototype.stop = function() {
  this.tween && this.tween.stop();
  this.parent.chassis.tint = 0xFFFFFF;
  this.parent.removeChild(this.sprite);
};

Repair.prototype.destroy = function() {
  this.stop();
  this.parent = this.game = undefined;
};

module.exports = Repair;
