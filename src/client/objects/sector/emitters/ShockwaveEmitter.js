
var engine = require('engine');

function ShockwaveEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 500);

  // this.lifespan = 350;

  // this.blendMode = engine.BlendMode.ADD;

  // this.setScale(0.0, 4.0, 0.0, 4.0, 350);

  // this.minRotation = 0;
  // this.maxRotation = 0;

  // this.setAlpha(1.0, 0.0, 250);
  // this.setTint('default', 0xFF0000, 0xFFFFFF, 250);

  // this.makeParticles('texture-atlas', 'explosion-c.png');
};

ShockwaveEmitter.prototype = Object.create(engine.Emitter.prototype);
ShockwaveEmitter.prototype.constructor = ShockwaveEmitter;

module.exports = ShockwaveEmitter;
