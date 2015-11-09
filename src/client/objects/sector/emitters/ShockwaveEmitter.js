
var engine = require('engine');

function ShockwaveEmitter(game) {
  engine.Emitter.call(this, game, 0, 0);

  this.blendMode = engine.BlendMode.ADD;

  this.setScale(0.5, 3.0, 0.5, 3.0, 1000);
  this.minRotation = -45;
  this.maxRotation = 45;
  this.setAlpha(1.0, 0.0, 1000);
  this.setTint(0xFF0000, 0xFFFFFF, 500);
  this.makeParticles(['explosion-c', 'explosion-d']);
};

ShockwaveEmitter.prototype = Object.create(engine.Emitter.prototype);
ShockwaveEmitter.prototype.constructor = ShockwaveEmitter;

module.exports = ShockwaveEmitter;
