
var engine = require('engine');

function ShockwaveEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 500);

  this.blendMode = engine.BlendMode.ADD;

  this.makeParticles('texture-atlas', ['explosion-c.png']);
};

ShockwaveEmitter.prototype = Object.create(engine.Emitter.prototype);
ShockwaveEmitter.prototype.constructor = ShockwaveEmitter;

ShockwaveEmitter.prototype.explosion = function(size) {
  this.lifespan = 1200;

  this.setScale(size/4, size*4, 1200);
  this.setAlpha(1.0, 0.0, 1200);
  this.setTint(0xffffff, 0xff8822, 1200);
};

module.exports = ShockwaveEmitter;
