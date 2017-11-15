
var pixi = require('pixi'),
    engine = require('engine'),
    OutlineFilter = require('../../../fx/filters/OutlineFilter'),
    ShieldFilter = require('../../../fx/filters/ShieldFilter');

function ShieldGenerator(parent) {
  this.parent = parent;
  this.game = parent.game;
};

ShieldGenerator.prototype.constructor = ShieldGenerator;

ShieldGenerator.prototype.create = function() {
  this.shieldSprite = new engine.Sprite(this.game, 'texture-atlas', this.parent.data.chassis + '.png');
  this.outlineSprite = new engine.Sprite(this.game, 'texture-atlas', this.parent.data.chassis + '.png');

  this.shieldFilter = new ShieldFilter(this.game, this.shieldSprite);
  this.outlineFilter = new OutlineFilter(1.0, 0x99ccff);

  this.outlineSprite.filters = [this.outlineFilter];
  this.shieldSprite.filters = [this.shieldFilter];
};

ShieldGenerator.prototype.start = function() {
  this.parent.addChild(this.outlineSprite);
  this.parent.addChild(this.shieldSprite);
};

ShieldGenerator.prototype.stop = function() {
  this.parent.removeChild(this.outlineSprite);
  this.parent.removeChild(this.shieldSprite);
};

ShieldGenerator.prototype.destroy = function() {
  this.stop();
  this.parent = this.game =
    this.shieldSprite = this.shieldShader = 
    this.renderTexture = this.tween = undefined;
};

module.exports = ShieldGenerator;
