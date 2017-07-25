
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
      colors = colors || ['0xFF9999', '0x666666'];

  this.lifespan = 512;

  this.minRotation = -64;
  this.maxRotation = 64;

  this.setVelocity(speed, speed);
  this.setVector(rnd.frac(), rnd.frac());

  this.setScale(4.0, 2.0, 512);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 512);
};

FlashEmitter.prototype.critical = function(colors) {
  var rnd = this.game.rnd,
      speed = rnd.frac() * 256 + 256,
      colors = colors || ['0xFF9999', '0xFF6666'];

  this.lifespan = 4096;

  this.minRotation = -96;
  this.maxRotation = 96;

  this.setVelocity(speed, speed);
  this.setVector(rnd.frac(), rnd.frac());

  this.setScale(4.0, 2.0, 4096);
  this.setAlpha(1.0, 0.0, 4096);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 4096);
};

module.exports = FlashEmitter;
