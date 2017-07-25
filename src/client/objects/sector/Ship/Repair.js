
var engine = require('engine'),
    pixi = require('pixi');

function Repair(parent) {
  this.parent = parent;
  this.game = parent.game;
};

Repair.prototype.constructor = Repair;

Repair.prototype.create = function() {
  this.sprite = new engine.Sprite(this.game, 'texture-atlas', this.parent.data.chassis + '.png');
  this.sprite.blendMode = engine.BlendMode.ADD;
  this.sprite.tint = 0x00FF00;
  this.sprite.alpha = 0.0;
};

Repair.prototype.start = function() {
  this.sprite.alpha = 0.4;

  this.tween && this.tween.stop(true);
  this.tween = this.game.tweens.create(this.sprite);
  this.tween.to({ alpha: 0.2 }, 1000, engine.Easing.Quadratic.InOut);
  this.tween.yoyo(true, 250);
  this.tween.repeat();
  this.tween.on('complete', this.remove, this);
  this.tween.start();

  this.parent.addChild(this.sprite);
};

Repair.prototype.stop = function() {
  this.tween && this.tween.stop(true);
  this.parent.removeChild(this.sprite);
};

Repair.prototype.remove = function() {
  this.parent.removeChild(this.sprite);
};

Repair.prototype.destroy = function() {
  this.stop();
  this.parent = this.game = undefined;
};

module.exports = Repair;
