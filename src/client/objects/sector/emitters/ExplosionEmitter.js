
var engine = require('engine');

function ExplosionEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 500);

  this.lifespan = 1000;
   
  this.minRotation = -30;
  this.maxRotation = 30;

  this.setScale(0.25, 2.0, 0.25, 2.0, 1000);
  this.setAlpha(1.0, 0.0, 1000);
  this.setTint('default', 0xFF8888, 0x181818, 500);

  this.makeParticles('texture-atlas', [
    'explosion-a.png', 'explosion-b.png'
  ]);
};

ExplosionEmitter.prototype = Object.create(engine.Emitter.prototype);
ExplosionEmitter.prototype.constructor = ExplosionEmitter;

module.exports = ExplosionEmitter;
