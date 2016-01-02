
var engine = require('engine');

function FlashEmitter(game) {
  engine.Emitter.call(this, game, 0, 0);

  this.blendMode = engine.BlendMode.ADD;
  this.setScale(0.0, 1.5, 0.0, 1.5, 250);
  this.minRotation = 0;
  this.maxRotation = 0;
  this.setAlpha(1.0, 0.0, 250);
  this.setTint(0x336699, 0x6699BB, 250);
  this.makeParticles('fx-atlas', 'explosion-flash.png');
};

FlashEmitter.prototype = Object.create(engine.Emitter.prototype);
FlashEmitter.prototype.constructor = FlashEmitter;

FlashEmitter.prototype.color = function(color) {
  this.setTint(0x336699, color || 0x6699BB, 100);
};

module.exports = FlashEmitter;
