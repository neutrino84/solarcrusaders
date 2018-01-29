
var engine = require('engine');

function ShockwaveEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 500);

  this.name = 'shockwave';
  this.blendMode = engine.BlendMode.ADD;
  this.makeParticles('texture-atlas', ['explosion-c.png']);
};

ShockwaveEmitter.prototype = Object.create(engine.Emitter.prototype);
ShockwaveEmitter.prototype.constructor = ShockwaveEmitter;

ShockwaveEmitter.prototype.explosion = function(size) {
  this.lifespan = 1024;

  this.setScale(size/4, size*4, 1024);
  this.setAlpha(1.0, 0.0, 1024);
  this.setTint(0xffffff, 0xff9933, 1024);
};

ShockwaveEmitter.prototype.slow = function(size) {
  this.lifespan = 3072;

  this.setScale(2.0, size / 14.0, this.lifespan);
  this.setAlpha(1.0, 0.0, this.lifespan);
  this.setTint(0x000000, 0xffffff, 256);
};

module.exports = ShockwaveEmitter;
