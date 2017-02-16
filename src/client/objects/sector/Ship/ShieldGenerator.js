
var pixi = require('pixi'),
    engine = require('engine'),
    ShieldFilter = require('../../../fx/filters/ShieldFilter');

function ShieldGenerator(parent) {
  this.parent = parent;
  this.game = parent.game;
};

ShieldGenerator.prototype.constructor = ShieldGenerator;

ShieldGenerator.prototype.create = function() {
  this.shieldSprite = new engine.Sprite(this.game, 'texture-atlas', this.parent.details.chassis + '.png');
  this.shieldSprite.filters = [new pixi.filters.BlurFilter(10, 4)];
  this.shieldSprite.cache();
  this.shieldSprite.filters = [new ShieldFilter(this.game, this.shieldSprite)];
};

ShieldGenerator.prototype.start = function() {
  this.tween && this.tween.stop(true);
  this.tween = this.game.tweens.create(this.shieldSprite);
  this.tween.to({ alpha: 0.0 }, 500, engine.Easing.Quadratic.InOut);
  this.tween.on('complete', this.remove, this);

  this.parent.addChild(this.shieldSprite);
};

ShieldGenerator.prototype.stop = function() {
  this.tween && this.tween.start();
};

ShieldGenerator.prototype.remove = function() {
  this.shieldSprite.alpha = 1.0;
  this.parent.removeChild(this.shieldSprite);
};

ShieldGenerator.prototype.destroy = function() {
  this.stop();
  this.parent = this.game =
    this.shieldSprite = this.shieldShader = 
    this.renderTexture = this.tween = undefined;
};

module.exports = ShieldGenerator;
