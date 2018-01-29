
var engine = require('engine');

function ExplosionEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 1000);

  this.name = 'explosion';
  this.makeParticles('texture-atlas', ['explosion-a.png', 'explosion-b.png']);
};

ExplosionEmitter.prototype = Object.create(engine.Emitter.prototype);
ExplosionEmitter.prototype.constructor = ExplosionEmitter;

ExplosionEmitter.prototype.small = function() {
  this.lifespan = 512;

  this.blendMode = engine.BlendMode.ADD;

  this.minRotation = -96;
  this.maxRotation = 96;

  this.setScale(0.25, 0.75, 256);
  this.setAlpha(1.0, 0.0, 512);
  this.setTint(0xFF8888, 0xFF6666, 256);
};

ExplosionEmitter.prototype.medium = function() {
  this.lifespan = 1024;

  this.blendMode = engine.BlendMode.NORMAL;

  this.minRotation = -96;
  this.maxRotation = 96;

  this.setScale(0.25, 2.25, 1024);
  this.setAlpha(1.0, 0.0, 1024);
  this.setTint(0xff8888, 0x666666, 768);
};

ExplosionEmitter.prototype.large = function() {
  this.lifespan = this.game.rnd.pick([1280, 2048]);
  this.blendMode = engine.BlendMode.ADD;

  this.minRotation = -128;
  this.maxRotation = 128;

  this.setScale(1.0, 2.4, this.lifespan);
  this.setAlpha(1.0, 0.0, this.lifespan);
  this.setTint(0x000000, 0xff9966, 96);
};

ExplosionEmitter.prototype.smoke = function(size) {
  var game = this.game,
      size = size / game.rnd.pick([140, 120, 100]);

  this.lifespan = 8192;
  this.blendMode = engine.BlendMode.NORMAL;

  this.minRotation = -24;
  this.maxRotation = 24;

  this.setScale(0.0, size, 4096);
  this.setAlpha(1.0, 0.0, 8192);
  this.setTint(0x666666, 0x222222, 4096);
};

ExplosionEmitter.prototype.explosion = function() {
  this.lifespan = 1024;
  this.blendMode = engine.BlendMode.ADD;

  this.minRotation = -96;
  this.maxRotation = 96;

  this.setVelocity(
    this.game.rnd.realInRange(-64, 64),
    this.game.rnd.realInRange(-64, 64));
  this.setVector(this.game.rnd.frac(), this.game.rnd.frac());

  this.setScale(0.25, 1.5, 1024);
  this.setAlpha(1.0, 0.0, 1024);
  this.setTint(0xFF8888, 0x552222, 1024);
};

ExplosionEmitter.prototype.projectile = function(vector) {
  this.lifespan = 1200;
  this.blendMode = engine.BlendMode.NORMAL;

  this.minRotation = -32;
  this.maxRotation = 32;

  this.setVelocity(
    this.game.rnd.realInRange(-32, 32),
    this.game.rnd.realInRange(-32, 32));
  this.setVector(this.game.rnd.frac(), this.game.rnd.frac());

  this.setScale(0.5, 1.0, 1200);
  this.setAlpha(1.0, 0.0, 1200);
  this.setTint(0xFF9999, 0x999999, 1200);
};

ExplosionEmitter.prototype.plasma = function() {
  this.lifespan = 1200;
  this.blendMode = engine.BlendMode.ADD;

  this.minRotation = -12;
  this.maxRotation = 12;

  this.setVelocity(
    this.game.rnd.realInRange(-32, 32),
    this.game.rnd.realInRange(-32, 32));
  this.setVector(this.game.rnd.frac(), this.game.rnd.frac());

  this.setScale(1.0, 3.0, 1000);
  this.setAlpha(1.0, 0.0, 1200);
  this.setTint(0xFF8888, 0x484848, 800);
};

module.exports = ExplosionEmitter;
