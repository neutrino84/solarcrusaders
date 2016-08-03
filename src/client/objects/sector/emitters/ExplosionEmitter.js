
var engine = require('engine');

function ExplosionEmitter(game) {
  engine.Emitter.call(this, game, 0, 0);
   
  this.minRotation = -15;
  this.maxRotation = 15;

  this.setScale(1.0, 3.0, 1.0, 3.0, 3000);
  this.setAlpha(1.0, 0.0, 3000);
  this.setTint(0xFF8888, 0x181818, 500);

  this.makeParticles('texture-atlas', [
    'explosion-a.png', 'explosion-b.png',
    'explosion-a.png', 'explosion-b.png'
  ]);
};

ExplosionEmitter.prototype = Object.create(engine.Emitter.prototype);
ExplosionEmitter.prototype.constructor = ExplosionEmitter;

module.exports = ExplosionEmitter;
