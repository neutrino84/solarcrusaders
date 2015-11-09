
var engine = require('engine');

function FlashEmitter(game) {
  engine.Emitter.call(this, game, 0, 0);

  this.blendMode = engine.BlendMode.ADD;
  this.setScale(0.0, 1.0, 0.0, 1.0, 200);
  this.minRotation = 0;
  this.maxRotation = 0;
  this.setAlpha(1.0, 0.0, 200);
  this.setTint(0x336699, 0x003366, 100);
  this.makeParticles('explosion-flash');
};

FlashEmitter.prototype = Object.create(engine.Emitter.prototype);
FlashEmitter.prototype.constructor = FlashEmitter;

module.exports = FlashEmitter;
