
var engine = require('engine');

function GlowEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 1000);

  this.blendMode = engine.BlendMode.ADD;

  this.makeParticles('texture-atlas', ['explosion-d.png']);
};

GlowEmitter.prototype = Object.create(engine.Emitter.prototype);
GlowEmitter.prototype.constructor = GlowEmitter;

GlowEmitter.prototype.explosion = function(size) {
  this.lifespan = 1200;

  this.setScale(size/8, size*2, 600);
  this.setAlpha(1.0, 0.0, 1200);
  this.setTint(0xFFFFFF, 0xF4F4F4, 300);
};

GlowEmitter.prototype.burst = function(size) {
  this.lifespan = 1000;

  this.setScale(size/12, size/6, 500);
  this.setAlpha(1.0, 0.0, 1000);
  this.setTint(0x180808, 0x442828, 500);
};

module.exports = GlowEmitter;
