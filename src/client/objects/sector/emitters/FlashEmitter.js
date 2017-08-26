
var engine = require('engine');

function FlashEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 500);

  this.blendMode = engine.BlendMode.ADD;
  
  this.makeParticles('texture-atlas', 'explosion-e.png');
};

FlashEmitter.prototype = Object.create(engine.Emitter.prototype);
FlashEmitter.prototype.constructor = FlashEmitter;

FlashEmitter.prototype.attack = function(colors) {
  var rnd = this.game.rnd,
      speed = rnd.frac() * 256 + 256,
      colors = colors || ['0xFFaaaa', '0xFF9999'];

  this.lifespan = 512;

  this.minRotation = -64;
  this.maxRotation = 64;

  this.setVelocity(speed, speed);
  this.setVector(rnd.frac()/2, rnd.frac()/2);

  this.setScale(2.0, 1.0, 512);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 512);
};

FlashEmitter.prototype.critical = function(colors) {
  var rnd = this.game.rnd,
      speed = rnd.frac() * 256 + 256,
      colors = colors || ['0xFFaaaa', '0xFF0000'];

  this.lifespan = 4096;

  this.minRotation = -64;
  this.maxRotation = 64;

  this.setVelocity(speed, speed);
  this.setVector(rnd.frac()/2, rnd.frac()/2);

  this.setScale(2.0, 1.0, 4096);
  this.setAlpha(1.0, 0.0, 4096);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 2048);
};

module.exports = FlashEmitter;
