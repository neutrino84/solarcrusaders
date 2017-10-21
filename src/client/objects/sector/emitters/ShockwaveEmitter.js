
var engine = require('engine');

function ShockwaveEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 500);

  this.blendMode = engine.BlendMode.ADD;

  this.makeParticles('texture-atlas', ['explosion-c.png']);
};

ShockwaveEmitter.prototype = Object.create(engine.Emitter.prototype);
ShockwaveEmitter.prototype.constructor = ShockwaveEmitter;

ShockwaveEmitter.prototype.shockwave = function(colors) {
  colors = colors || ['0xFFFFFF', '0xf4f4f4'];

  this.lifespan = 1800;

  this.setVelocity(0, 0);
  this.setVector(0, 0);

  this.setScale(0.5, 2.0, 600);
  this.setAlpha(1.0, 0.0, 1800);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 1800);
};

ShockwaveEmitter.prototype.rocket = function() {
  this.lifespan = 400;

  this.setVelocity(0, 0);
  this.setVector(0, 0);

  this.setScale(0.25, 2.0, 400);
  this.setAlpha(1.0, 0.0, 400);
  this.setTint(0xFF8888, 0xFFFFFF, 400);
};

ShockwaveEmitter.prototype.explosion = function(size) {
  this.lifespan = 1200;

  this.setScale(size/1.5, size, 1200);
  this.setAlpha(1.0, 0.0, 1200);
  this.setTint(0xFFFFFF, 0x6699CC, 600);
};

module.exports = ShockwaveEmitter;
