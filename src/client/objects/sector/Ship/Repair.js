
var engine = require('engine'),
    OutlineFilter = require('../../../fx/filters/OutlineFilter');

function Repair(parent) {
  this.parent = parent;
  this.game = parent.game;
};

Repair.prototype.constructor = Repair;

Repair.prototype.create = function() {
  this.sprite = new engine.Sprite(this.game, 'texture-atlas', this.parent.details.chassis + '.png');
  this.sprite.filters = [new OutlineFilter(this.sprite.width/1.5, this.sprite.height/1.5)];
  this.sprite.cache();
  this.sprite.filters = [];
  this.sprite.blendMode = engine.BlendMode.ADD;
  this.sprite.tint = 0x00FF00;
  this.sprite.alpha = 0.0;
};

Repair.prototype.start = function() {
  this.tween && this.tween.stop(true);
  this.tween = this.game.tweens.create(this.sprite);
  this.tween.to({ alpha: 0.5 }, 500, engine.Easing.Quadratic.InOut);
  this.tween.yoyo(true);
  this.tween.repeat();
  this.tween.on('complete', this.remove, this);
  this.tween.start();

  this.parent.addChild(this.sprite);
};

Repair.prototype.stop = function() {
  this.tween && this.tween.stop(true);
};

Repair.prototype.remove = function() {
  this.sprite.alpha = 0.0;
  this.parent.removeChild(this.sprite);
}

Repair.prototype.destroy = function() {
  this.stop();
  this.parent = this.game = undefined;
};

module.exports = Repair;
