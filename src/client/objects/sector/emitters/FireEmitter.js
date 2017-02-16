
var engine = require('engine');

function FireEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 500);

  this.lifespan = 500;

  this.minRotation = -10;
  this.maxRotation = 10;

  this.blendMode = engine.BlendMode.ADD;
  
  this.setScale(0.1, 0.5, 0.1, 0.5, 500);
  this.setAlpha(1.0, 0.0, 500);
  this.setTint('red', 0xFFFFFF, 0xFF0000, 250);
  this.setTint('blue', 0xFFFFFF, 0x12def9, 250);
  this.setTint('engine', 0xFF0000, 0xFFFFFF, 500);
  
  this.makeParticles('texture-atlas', ['explosion-d.png']);
};

FireEmitter.prototype = Object.create(engine.Emitter.prototype);
FireEmitter.prototype.constructor = FireEmitter;

FireEmitter.prototype.color = function(key) {
  this.setTint(key);
};

module.exports = FireEmitter;
