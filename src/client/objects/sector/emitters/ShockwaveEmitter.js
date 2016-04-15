
var engine = require('engine');

function ShockwaveEmitter(game) {
  engine.Emitter.call(this, game, 0, 0);

  this.blendMode = engine.BlendMode.ADD;

  this.setScale(0.5, -4.0, 0.5, 4.0, 4000);
  this.minRotation = -45;
  this.maxRotation = 45;
  this.setAlpha(1.0, 0.0, 4000);
  this.setTint(0x99AAFF, 0xFFFFFF, 4000);

  this.makeParticles('texture-atlas', 'explosion-c.png');
};

ShockwaveEmitter.prototype = Object.create(engine.Emitter.prototype);
ShockwaveEmitter.prototype.constructor = ShockwaveEmitter;

module.exports = ShockwaveEmitter;
