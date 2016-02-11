
var engine = require('engine');

function FireEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 200);
   
  this.minRotation = -10;
  this.maxRotation = 10;

  this.blendMode = engine.BlendMode.ADD;
  this.setScale(0.1, 0.6, 0.1, 0.6, 500);
  this.setAlpha(1.0, 0.0, 1000);
  this.setTint(0xFF6666, 0x333333, 500);

  this.makeParticles('texture-atlas', [
    'explosion-d.png', 'engine-smoke.png'
  ]);
};

FireEmitter.prototype = Object.create(engine.Emitter.prototype);
FireEmitter.prototype.constructor = FireEmitter;

module.exports = FireEmitter;
