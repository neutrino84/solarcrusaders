
var engine = require('engine');

function FlashEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 500);

  this.minRotation = -20;
  this.maxRotation = 20;

  this.blendMode = engine.BlendMode.ADD;

  this.setScale(0.1, 0.5, 0.1, 0.5, 500);
  this.setAlpha(1.0, 0.0, 500);
  this.setTint(0xFFFFFF, 0x888888, 400);
  
  this.makeParticles('texture-atlas', 'explosion-d.png');
};

FlashEmitter.prototype = Object.create(engine.Emitter.prototype);
FlashEmitter.prototype.constructor = FlashEmitter;

module.exports = FlashEmitter;
