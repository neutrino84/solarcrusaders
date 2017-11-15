
var engine = require('engine');

function GlowEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 1000);

  this.blendMode = engine.BlendMode.ADD;

  this.makeParticles('texture-atlas', ['explosion-d.png']);
};

GlowEmitter.prototype = Object.create(engine.Emitter.prototype);
GlowEmitter.prototype.constructor = GlowEmitter;

GlowEmitter.prototype.explosion = function(size) {
  this.lifespan = 2800;

  this.setScale(size/24, size*1.2, 800);
  this.setAlpha(1.0, 0.0, 2800);
  this.setTint(0x000000, 0xffffff, 400);
};

GlowEmitter.prototype.burst = function(size) {
  this.lifespan = 1200;

  this.setScale(size/4.8, size/24, 1200);
  this.setAlpha(0.2, 0.0, 1200);
  this.setTint(0x000000, 0xff6633, 400);
};

module.exports = GlowEmitter;
