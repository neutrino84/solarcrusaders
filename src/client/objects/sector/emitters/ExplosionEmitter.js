
var engine = require('engine');

function ExplosionEmitter(game) {
  engine.Emitter.call(this, game, 0, 0);

  this.setScale(0.25, 1.0, 0.25, 1.0, 2000);
  this.minRotation = -30;
  this.maxRotation = 30;
  this.setAlpha(1.0, 0.0, 2000);
  this.setTint(0xFF6666, 0x000000, 500);
  this.makeParticles(['explosion-flash', 'explosion-a', 'explosion-b']);
};

ExplosionEmitter.prototype = Object.create(engine.Emitter.prototype);
ExplosionEmitter.prototype.constructor = ExplosionEmitter;

module.exports = ExplosionEmitter;
