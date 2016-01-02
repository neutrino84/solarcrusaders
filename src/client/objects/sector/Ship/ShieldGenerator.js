
var engine = require('engine');

function ShieldGenerator(parent) {
  this.parent = parent;
  this.game = parent.game;
};

ShieldGenerator.prototype.constructor = ShieldGenerator;

ShieldGenerator.prototype.create = function() {
  this.shieldSprite = new engine.Sprite(this.game, 'texture-atlas', this.parent.name + '-shields.png');
  this.shieldSprite.blendMode = engine.BlendMode.ADD;
  this.shieldSprite.tint = 0x3366FF;
  this.shieldSprite.pivot.set(16, 16);
};

ShieldGenerator.prototype.start = function() {
  this.shieldSprite.alpha = 1.0;
  
  this.fadeTween = this.game.tweens.create(this.shieldSprite);
  this.fadeTween.to({ alpha: 0.80 }, 100, engine.Easing.Quadratic.InOut);
  this.fadeTween.repeat();
  this.fadeTween.yoyo(true, 0);
  this.fadeTween.start();
  
  this.parent.addChild(this.shieldSprite);
};

ShieldGenerator.prototype.stop = function() {
  this.fadeTween && this.fadeTween.stop();
  this.parent.removeChild(this.shieldSprite);
};

ShieldGenerator.prototype.destroy = function() {
  this.stop();
  this.parent = this.game = this.shieldSprite =
    this.fadeTween = undefined;
};

module.exports = ShieldGenerator;
