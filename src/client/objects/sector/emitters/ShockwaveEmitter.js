
var engine = require('engine');

function ShockwaveEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 500);

  this.vector = new engine.Point();

  this.makeParticles('texture-atlas', 'explosion-c.png');
};

ShockwaveEmitter.prototype = Object.create(engine.Emitter.prototype);
ShockwaveEmitter.prototype.constructor = ShockwaveEmitter;

ShockwaveEmitter.prototype.shockwave = function(colors) {
  colors = colors || [0xFF6666, 0xFFFFFF];
  
  this.blendMode = engine.BlendMode.ADD;

  this.frequency = 100;
  this.lifespan = 800;

  this.setVelocity(0, 0);
  this.setVector(0, 0);

  this.setScale(0.5, 2.5, 800);
  this.setAlpha(1.0, 0.0, 800);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 800);
};

module.exports = ShockwaveEmitter;
