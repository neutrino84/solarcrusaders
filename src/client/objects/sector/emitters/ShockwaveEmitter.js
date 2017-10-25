
var engine = require('engine');

function ShockwaveEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 500);

  this.blendMode = engine.BlendMode.ADD;

  this.makeParticles('texture-atlas', ['explosion-c.png']);
};

ShockwaveEmitter.prototype = Object.create(engine.Emitter.prototype);
ShockwaveEmitter.prototype.constructor = ShockwaveEmitter;

ShockwaveEmitter.prototype.explosion = function(size) {
  this.lifespan = 1400;

  this.setScale(size/2, size*2, 1400);
  this.setAlpha(1.0, 0.0, 1400);
  this.setTint(0xFFFFFF, 0xF2F2F2, 300);
};

module.exports = ShockwaveEmitter;
