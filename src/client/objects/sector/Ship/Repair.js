
var engine = require('engine'),
    pixi = require('pixi'),
    OutlineFilter = require('../../../fx/filters/OutlineFilter');

function Repair(parent) {
  this.parent = parent;
  this.game = parent.game;
};

Repair.prototype.constructor = Repair;

Repair.prototype.create = function() {
  this.outlineFilter = new OutlineFilter(0.5, 0x33ff33);
  this.outlineSprite = new engine.Sprite(this.game, 'texture-atlas', this.parent.data.chassis + '.png');
  this.outlineSprite.blendMode = engine.BlendMode.ADD;
  this.outlineSprite.filters = [this.outlineFilter];
};

Repair.prototype.start = function() {
  this.parent.addChild(this.outlineSprite);
};

Repair.prototype.stop = function() {
  this.parent.removeChild(this.outlineSprite);
};

Repair.prototype.destroy = function() {
  this.stop();
  this.parent = this.game = undefined;
};

module.exports = Repair;
