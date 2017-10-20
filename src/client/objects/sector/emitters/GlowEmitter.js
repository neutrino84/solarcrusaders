
var engine = require('engine');

function GlowEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 1000);

  this.blendMode = engine.BlendMode.ADD;

  this.makeParticles('texture-atlas', 'explosion-d.png');
};

GlowEmitter.prototype = Object.create(engine.Emitter.prototype);
GlowEmitter.prototype.constructor = GlowEmitter;

GlowEmitter.prototype.explosion = function(size) {
  this.lifespan = 2000;

  this.setScale(1.0, size, 1000);
  this.setAlpha(1.0, 0.0, 2000);
  this.setTint(0xFFFFFF, 0x999999, 2000);
};

module.exports = GlowEmitter;
