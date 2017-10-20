
var engine = require('engine');

function ExplosionEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 1000);

  this.makeParticles('texture-atlas', ['explosion-a.png', 'explosion-b.png']);
};

ExplosionEmitter.prototype = Object.create(engine.Emitter.prototype);
ExplosionEmitter.prototype.constructor = ExplosionEmitter;

ExplosionEmitter.prototype.small = function() {
  this.lifespan = 500;

  this.blendMode = engine.BlendMode.ADD;

  this.minRotation = -96;
  this.maxRotation = 96;

  this.setScale(0.25, 0.75, 250);
  this.setAlpha(1.0, 0.0, 500);
  this.setTint(0xFF8888, 0xFF6666, 250);
};

ExplosionEmitter.prototype.medium = function() {
  this.lifespan = 1000;

  this.blendMode = engine.BlendMode.NORMAL;

  this.minRotation = -96;
  this.maxRotation = 96;

  this.setScale(0.25, 2.25, 1000);
  this.setAlpha(1.0, 0.0, 1000);
  this.setTint(0xFF8888, 0x666666, 750);
};

ExplosionEmitter.prototype.explosion = function(size) {
  this.lifespan = 1024;

  this.blendMode = engine.BlendMode.ADD;

  this.minRotation = -64;
  this.maxRotation = 64;

  this.setScale(1.0, size, 1024);
  this.setAlpha(1.0, 0.0, 1024);
  this.setTint(0xFF3333, 0x333333, 512);
};

ExplosionEmitter.prototype.smulder = function() {
  this.lifespan = 1000;

  this.blendMode = engine.BlendMode.NORMAL;

  this.minRotation = -180;
  this.maxRotation = 180;

  this.setScale(0.25, 2, 1000);
  this.setAlpha(0.5, 0.0, 1000);
  this.setTint(0x333333, 0x666666, 1000);
};

ExplosionEmitter.prototype.rocket = function() {
  this.blendMode = engine.BlendMode.ADD;

  this.lifespan = 400;

  this.minRotation = -32;
  this.maxRotation = 32;

  this.setVelocity(this.game.rnd.realInRange(-32, 32), this.game.rnd.realInRange(-32, 32));
  this.setVector(this.game.rnd.frac(), this.game.rnd.frac());

  this.setScale(0.5, 2.0, 150);
  this.setAlpha(1.0, 0.0, 400);
  this.setTint(0xFF3333, 0x333333, 150);
};

ExplosionEmitter.prototype.plasma = function() {
  this.lifespan = 1200;

  this.blendMode = engine.BlendMode.ADD;

  this.minRotation = -12;
  this.maxRotation = 12;

  this.setVelocity(this.game.rnd.realInRange(-32, 32), this.game.rnd.realInRange(-32, 32));
  this.setVector(this.game.rnd.frac(), this.game.rnd.frac());

  this.setScale(1.0, 3.0, 1000);
  this.setAlpha(1.0, 0.0, 1200);
  this.setTint(0xFF8888, 0x484848, 800);
};

module.exports = ExplosionEmitter;
