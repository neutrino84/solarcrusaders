
var engine = require('engine');

function ShockwaveEmitter(game) {
  engine.Emitter.call(this, game, 0, 0);

  this.blendMode = engine.BlendMode.ADD;

  this.setScale(0.1, 3.0, 0.1, 3.0, 4000);
  this.minRotation = -15;
  this.maxRotation = 15;
  this.setAlpha(1.0, 0.0, 4000);
  this.makeParticles('texture-atlas', [
    'explosion-e.png'
  ]);
};

ShockwaveEmitter.prototype = Object.create(engine.Emitter.prototype);
ShockwaveEmitter.prototype.constructor = ShockwaveEmitter;

module.exports = ShockwaveEmitter;
