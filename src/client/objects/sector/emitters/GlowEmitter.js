
var engine = require('engine');

function GlowEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 1000);

  this.name = 'glow';
  this.makeParticles('texture-atlas', ['explosion-d.png']);
};

GlowEmitter.prototype = Object.create(engine.Emitter.prototype);
GlowEmitter.prototype.constructor = GlowEmitter;

GlowEmitter.prototype.explosion = function(size) {
  this.lifespan = 2800;
  this.blendMode = engine.BlendMode.ADD;

  this.setScale(size/24, size*1.2, 200);
  this.setAlpha(0.2, 0.0, 2800);
  this.setTint(0x000000, 0xffffff, 200);
};

GlowEmitter.prototype.burst = function(size) {
  this.lifespan = this.game.rnd.pick([512, 1024]);
  this.blendMode = engine.BlendMode.ADD;

  this.setScale(size / 14.0, size / 66.0, this.lifespan);
  this.setAlpha(0.26, 0.0, this.lifespan);
  this.setTint(0x000000, 0xff6644, 128);
};

GlowEmitter.prototype.glitch = function() {
  this.lifespan = 1024;
  this.blendMode = engine.BlendMode.ADD;

  this.setScale(0.0, 3.6, 128);
  this.setAlpha(0.36, 0.0, 1024);
  this.setTint(0xff0000, 0xffffff, 1024);
};

GlowEmitter.prototype.projectile = function() {
  this.lifespan = 600;
  this.blendMode = engine.BlendMode.ADD;

  this.setScale(1.6, 1.2, 600);
  this.setAlpha(1.0, 0.0, 600);
  this.setTint(0xff8822, 0x330000, 300);
};

module.exports = GlowEmitter;
