
var engine = require('engine');

function FlashEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 500);

  this.blendMode = engine.BlendMode.ADD;
  
  this.makeParticles('texture-atlas', 'explosion-d.png');
};

FlashEmitter.prototype = Object.create(engine.Emitter.prototype);
FlashEmitter.prototype.constructor = FlashEmitter;

FlashEmitter.prototype.attack = function(vector, speed, color) {
  color = color || [0x333333, 0x000000];

  this.lifespan = 400;

  this.setVelocity(speed, speed);
  this.setVector(vector.x, vector.y);

  this.setScale(2.5, 0.0, 400);
  this.setTint(color[0], color[1], 400);
};

module.exports = FlashEmitter;
