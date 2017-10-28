
var pixi = require('pixi'),
    engine = require('engine'),
    ShieldFilter = require('../../../fx/filters/ShieldFilter');

function ShieldGenerator(parent) {
  this.parent = parent;
  this.game = parent.game;
};

ShieldGenerator.prototype.constructor = ShieldGenerator;

ShieldGenerator.prototype.create = function() {
  this.shieldSprite = new engine.Sprite(this.game, 'texture-atlas', this.parent.data.chassis + '.png');
  this.shieldSprite.filters = [new pixi.filters.BlurFilter(10, 4)];
  this.shieldSprite.cache();
  this.shieldSprite.filters = [new ShieldFilter(this.game, this.shieldSprite)];

  // this.shieldSprite2 = new engine.Sprite(this.game, 'texture-atlas', this.parent.data.chassis + '.png');
  // this.shieldSprite2.filters = [new pixi.filters.BlurFilter(10, 4)];
  // this.shieldSprite2.cache();
  // this.shieldSprite2.filters = [new ShieldFilter(this.game, this.shieldSprite2)];
};

ShieldGenerator.prototype.start = function() {
  this.tween && this.tween.stop(true);
  this.tween = this.game.tweens.create(this.shieldSprite);
  this.tween.to({ alpha: 0.0 }, 500, engine.Easing.Quadratic.InOut);
  this.tween.on('complete', this.remove, this);

  this.parent.addChild(this.shieldSprite);
};

ShieldGenerator.prototype.startShieldField = function() {
  this.tween && this.tween.stop(true);
  this.tween = this.game.tweens.create(this.shieldSprite);
  this.tween.to({ alpha: 0.0 }, 500, engine.Easing.Quadratic.InOut);
  this.tween.on('complete', this.remove, this);

  this.parent.addChild(this.shieldSprite);
};

ShieldGenerator.prototype.stop = function() {
  this.tween && this.tween.start();
};

ShieldGenerator.prototype.stopShieldField = function() {
  this.tween && this.tween.start();
};

ShieldGenerator.prototype.remove = function() {
  this.shieldSprite.alpha = 1.0;
  this.parent.removeChild(this.shieldSprite);

  this.shieldSprite.alpha = 1.0;
  this.parent.removeChild(this.shieldSprite2);
};

ShieldGenerator.prototype.destroy = function() {
  this.stop();
  this.parent = this.game =
    this.shieldSprite = this.shieldShader = 
    this.renderTexture = this.tween = undefined;
};

module.exports = ShieldGenerator;
