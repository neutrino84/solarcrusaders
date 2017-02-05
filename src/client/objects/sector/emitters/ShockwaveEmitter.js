
var engine = require('engine');

function ShockwaveEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 500);

  this.lifespan = 500;

  this.blendMode = engine.BlendMode.ADD;

  this.setScale(0.1, 2.0, 0.1, 2.0, 500);

  this.minRotation = -45;
  this.maxRotation = 45;

  this.setAlpha(1.0, 0.0, 500);
  this.setTint(0xFFFFFF, 0x000000, 250);

  this.makeParticles('texture-atlas', 'explosion-c.png');
};

ShockwaveEmitter.prototype = Object.create(engine.Emitter.prototype);
ShockwaveEmitter.prototype.constructor = ShockwaveEmitter;

module.exports = ShockwaveEmitter;
