
var engine = require('engine');

function ExplosionEmitter(game) {
  engine.Emitter.call(this, game, 0, 0);
   
  this.minRotation = -30;
  this.maxRotation = 30;

  this.setScale(0.25, 0.8, 0.25, 0.8, 2000);
  this.setAlpha(1.0, 0.0, 3000);
  this.setTint(0xFF6666, 0x000000, 750);

  this.makeParticles('texture-atlas', [
  	'explosion-flash.png', 'explosion-a.png', 'explosion-a.png',
  	'explosion-b.png', 'explosion-c.png', 'explosion-a.png',
  	'explosion-d.png', 'explosion-d.png', 'explosion-d.png',
  	'explosion-b.png', 'explosion-b.png', 'explosion-b.png'
  ]);
};

ExplosionEmitter.prototype = Object.create(engine.Emitter.prototype);
ExplosionEmitter.prototype.constructor = ExplosionEmitter;

module.exports = ExplosionEmitter;
