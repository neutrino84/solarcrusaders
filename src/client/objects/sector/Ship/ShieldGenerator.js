
var pixi = require('pixi'),
    engine = require('engine'),
    ShieldFilter = require('../../../fx/filters/ShieldFilter'),
    OutlineFilter = require('../../../fx/filters/OutlineFilter');

function ShieldGenerator(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.renderer = this.game.renderer;

  this.shieldSprite = new engine.Sprite(this.game, 'texture-atlas', this.parent.name + '.png');
  this.outlineSprite = new engine.Sprite(this.game, 'texture-atlas', this.parent.name + '.png');

  this.width = this.shieldSprite.width
  this.height = this.shieldSprite.height;

  this.shieldsUpSFX = this.game.soundManager.shieldsUpSFX
  this.heavyShieldsUpSFX = this.game.soundManager.heavyShieldsUpSFX
};

ShieldGenerator.prototype.constructor = ShieldGenerator;

ShieldGenerator.prototype.create = function() {
  this.shieldSprite.blendMode = engine.BlendMode.ADD;
  this.shieldSprite.filters = [new ShieldFilter(this.game, this.shieldSprite)];
  this.outlineSprite.filters = [new OutlineFilter(this.width, this.height)];
};

ShieldGenerator.prototype.start = function() {
  if(this.game.playerObj.name === 'ubaidian-x02' || this.game.playerObj.name === 'ubaidian-x01'){this.heavyShieldsUpSFX.play('', 0, 0.7, false);}
  else {
    this.shieldsUpSFX.play('', 0, 1, false);
  }
  

  this.parent.addChild(this.shieldSprite);
  this.parent.addChild(this.outlineSprite);

  this.outlineSprite.alpha = 0.5;
  this.fadeTween = this.game.tweens.create(this.outlineSprite);
  this.fadeTween.to({ alpha: 0.25 }, 100, engine.Easing.Quadratic.InOut);
  this.fadeTween.repeat();
  this.fadeTween.yoyo(true, 0);
  this.fadeTween.start();
};

ShieldGenerator.prototype.stop = function() {
  this.fadeTween && this.fadeTween.stop();
  
  this.parent.removeChild(this.shieldSprite);
  this.parent.removeChild(this.outlineSprite);
};

ShieldGenerator.prototype.update = function() {
  //..
};

ShieldGenerator.prototype.destroy = function() {
  this.stop();
  this.parent = this.game =
    this.shieldSprite = this.shieldShader = 
    this.renderTexture = this.fadeTween = undefined;
};

module.exports = ShieldGenerator;
