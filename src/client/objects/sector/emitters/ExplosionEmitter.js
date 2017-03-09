
var engine = require('engine');

function ExplosionEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 500);

  this.makeParticles('texture-atlas', ['explosion-a.png', 'explosion-b.png']);
};

ExplosionEmitter.prototype = Object.create(engine.Emitter.prototype);
ExplosionEmitter.prototype.constructor = ExplosionEmitter;

ExplosionEmitter.prototype.small = function(ship) {
  var movement = ship.movement,
      speed = movement._speed,
      vector = movement._vector;

  this.lifespan = 1000;

  this.blendMode = engine.BlendMode.ADD;

  this.minRotation = -96;
  this.maxRotation = 96;

  this.setVelocity(speed * 2, speed * 2);
  this.setVector(vector.x, vector.y);

  this.setScale(this.game.rnd.realInRange(0.1, 0.25), this.game.rnd.realInRange(0.5, 0.75), 250);
  this.setAlpha(1.0, 0.0, 1000);
  this.setTint(0xFF8888, 0xFF6666, 250);
};

ExplosionEmitter.prototype.medium = function(ship) {
  var movement = ship.movement,
      speed = movement._speed,
      vector = movement._vector;

  this.lifespan = 2000;

  this.blendMode = engine.BlendMode.NORMAL;

  this.minRotation = -96;
  this.maxRotation = 96;

  this.setVelocity(speed * 2, speed * 2);
  this.setVector(vector.x, vector.y);

  this.setScale(this.game.rnd.realInRange(0.25, 0.75), this.game.rnd.realInRange(1.25, 2.25), 1000);
  this.setAlpha(1.0, 0.0, 2000);
  this.setTint(0xFF8888, 0x666666, 750);
};

ExplosionEmitter.prototype.explosion = function(ship) {
  var movement = ship.movement,
      speed = movement._speed,
      vector = movement._vector;

  this.lifespan = 2000;

  this.blendMode = engine.BlendMode.NORMAL;

  this.minRotation = -96;
  this.maxRotation = 96;

  this.setVelocity(speed * 2, speed * 2);
  this.setVector(vector.x, vector.y);

  this.setScale(1.0, ship.details.size / 48, 2000);
  this.setAlpha(1.0, 0.0, 2000);
  this.setTint(0xFF3333, 0x333333, 256);
};


ExplosionEmitter.prototype.smulder = function(ship) {
  var movement = ship.movement,
      speed = movement._speed,
      vector = movement._vector;

  this.lifespan = 2000;

  this.blendMode = engine.BlendMode.NORMAL;

  this.minRotation = -180;
  this.maxRotation = 180;

  this.setVelocity(speed * 2, speed * 2);
  this.setVector(vector.x, vector.y);

  this.setScale(this.game.rnd.realInRange(0.25, 1), this.game.rnd.realInRange(1.25, 2), 2000);
  this.setAlpha(0.5, 0.0, 2000);
  this.setTint(0x333333, 0x666666, 2000);
};

ExplosionEmitter.prototype.rocket = function() {
  this.lifespan = 2000;

  this.blendMode = engine.BlendMode.ADD;

  this.minRotation = -24;
  this.maxRotation = 24;

  this.setVelocity(this.game.rnd.realInRange(-64, 64), this.game.rnd.realInRange(-64, 64));
  this.setVector(this.game.rnd.frac(), this.game.rnd.frac());

  this.setScale(0.5, this.game.rnd.realInRange(1, 3), 500);
  this.setAlpha(1.0, 0.0, 2000);
  this.setTint(0xFF3333, 0x333333, 500);
};

module.exports = ExplosionEmitter;
