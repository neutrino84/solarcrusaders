
var engine = require('engine');

function FlashEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 500);

  this.name = 'flash';
  this.blendMode = engine.BlendMode.ADD;
  this.makeParticles('texture-atlas', 'explosion-e.png');
};

FlashEmitter.prototype = Object.create(engine.Emitter.prototype);
FlashEmitter.prototype.constructor = FlashEmitter;

FlashEmitter.prototype.explosion = function(colors) {
  var rnd = this.game.rnd,
      speed = rnd.frac() * 64 + 128,
      colors = colors || ['0xffaaaa', '0xff9999'];

  this.lifespan = 2048;

  this.setVelocity(speed, speed);
  this.setVector(-1 + rnd.frac() * 2, -1 + rnd.frac() * 2);

  this.setScale(1.0, 1.0, 2048);
  this.setAlpha(1.0, 0.0, 2048);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 2048);
};

FlashEmitter.prototype.large = function(colors) {
  var rnd = this.game.rnd,
      speed = rnd.integerInRange(64, 256),
      colors = colors || ['0xffcccc', '0xff6666'];

  this.lifespan = rnd.pick([2048, 4096]);

  this.setVelocity(speed, speed);
  this.setVector(-1 + rnd.frac() * 2, -1 + rnd.frac() * 2);

  this.setScale(1.64, 1.0, this.lifespan);
  this.setAlpha(1.0, 0.0, this.lifespan);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), this.lifespan);
};

FlashEmitter.prototype.glitch = function(colors) {
  var rnd = this.game.rnd,
      speed = rnd.integerInRange(32, 64),
      colors = colors || ['0xffcccc', '0xff3333'];

  this.lifespan = rnd.pick([1024, 1024, 2048, 2048, 2048, 8192]);

  this.setVelocity(speed, speed);
  this.setVector(-1 + rnd.frac() * 2, -1 + rnd.frac() * 2);

  this.setScale(1.0, 1.0, this.lifespan);
  this.setAlpha(1.0, 0.0, this.lifespan);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), this.lifespan);
};

FlashEmitter.prototype.attack = function(colors) {
  var rnd = this.game.rnd,
      speed = rnd.frac() * 128 + 128,
      colors = colors || ['0xffaaaa', '0xff9999'];

  this.lifespan = 512;

  this.setVelocity(speed, speed);
  this.setVector(-1 + rnd.frac() * 2, -1 + rnd.frac() * 2);

  this.setScale(2.0, 1.0, 512);
  this.setAlpha(1.0, 0.0, 512);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 512);
};

FlashEmitter.prototype.critical = function(colors) {
  var rnd = this.game.rnd,
      speed = rnd.frac() * 128 + 128,
      colors = colors || ['0xffaaaa', '0xff0000'];

  this.lifespan = 4096;

  this.setVelocity(speed, speed);
  this.setVector(-1 + rnd.frac() * 2, -1 + rnd.frac() * 2);

  this.setScale(2.0, 1.0, 4096);
  this.setAlpha(1.0, 0.0, 4096);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 2048);
};

module.exports = FlashEmitter;
