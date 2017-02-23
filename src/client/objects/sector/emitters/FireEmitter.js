
var engine = require('engine');

function FireEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 500);

  this.blendMode = engine.BlendMode.ADD;
  
  this.makeParticles('texture-atlas', 'explosion-d.png');
};

FireEmitter.prototype = Object.create(engine.Emitter.prototype);
FireEmitter.prototype.constructor = FireEmitter;

FireEmitter.prototype.pulse = function(colors) {
  colors = colors || [0xFFFFFF, 0xFF0000];
  
  this.lifespan = 800;
  
  this.setScale(0.2, 0.3, 800);
  this.setAlpha(1.0, 0.0, 800);
  this.setTint(colors[0], colors[1], 400);
};

FireEmitter.prototype.laser = function(colors) {
  colors = colors || [0xFFFFFF, 0xFF0000];
  
  this.lifespan = 800;
  
  this.setScale(0.0, 2.0, 400);
  this.setAlpha(1.0, 0.0, 800);
  this.setTint(colors[0], colors[1], 200);
};

FireEmitter.prototype.boost = function(colors, movement) {
  colors = colors || [0xFFFFFF, 0xFF0000];

  this.lifespan = 500;

  this.setVelocity(-movement._speed, -movement._speed);
  this.setVector(movement._vector.x, movement._vector.y);

  this.setScale(0.4, 0.6, 250);
  this.setAlpha(1.0, 0.0, 500);
  this.setTint(colors[0], colors[1], 250);
};

module.exports = FireEmitter;
