
var engine = require('engine');

function FlashEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 100);

  this.minRotation = -45;
  this.maxRotation = 45;

  this.blendMode = engine.BlendMode.ADD;
  this.setScale(0.1, 1.0, 0.1, 1.0, 250);
  this.setAlpha(1.0, 0.0, 250);
  this.setTint(0x336699, 0x666666, 250);
  this.makeParticles('texture-atlas', 'explosion-flash.png');
};

FlashEmitter.prototype = Object.create(engine.Emitter.prototype);
FlashEmitter.prototype.constructor = FlashEmitter;

FlashEmitter.prototype.color = function(color) {
  this.setTint(color || 0x336699, 0x666666, 100);
};

module.exports = FlashEmitter;
