
var engine = require('engine');

function ShieldGenerator(parent) {
  this.parent = parent;
  this.game = parent.game;
};

ShieldGenerator.prototype.constructor = ShieldGenerator;

ShieldGenerator.prototype.create = function() {
  this.shieldSprite = new engine.Sprite(this.game, this.parent.name + '-shields');
  this.shieldSprite.blendMode = engine.BlendMode.ADD;
  this.shieldSprite.alpha = 0.9;
  this.shieldSprite.tint = 0x3366FF;
  this.shieldSprite.pivot.set(64, 64);

  this.fadeTween = this.game.tweens.create(this.shieldSprite);
  this.fadeTween.to({ alpha: 0.56 }, 1800, engine.Easing.Quadratic.InOut);
  this.fadeTween.repeat();
  this.fadeTween.yoyo(true, 0);
  this.fadeTween.start();

  this.parent.addChild(this.shieldSprite);
};

module.exports = ShieldGenerator;
