
var engine = require('engine');

function GlowEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 500);

  this.blendMode = engine.BlendMode.ADD;

  this.vector = new engine.Point();

  this.makeParticles('texture-atlas', 'explosion-d.png');
};

GlowEmitter.prototype = Object.create(engine.Emitter.prototype);
GlowEmitter.prototype.constructor = GlowEmitter;

GlowEmitter.prototype.mini = function(ship) {
  var movement = ship.movement,
      speed = movement._speed * 2,
      vector = movement._vector;

  this.lifespan = 1000;

  this.setVelocity(speed, speed);
  this.setVector(vector.x, vector.y);

  this.setScale(0.0, ship.details.size / 8, 250);
  this.setTint(0xFFFFFF, 0x000000, 1000);
};

GlowEmitter.prototype.explosion = function(ship) {
  var movement = ship.movement,
      speed = movement._speed * 2,
      vector = movement._vector;

  this.lifespan = 2000;

  this.setVelocity(speed, speed);
  this.setVector(vector.x, vector.y);

  this.setScale(0.0, ship.details.size / 4, 500);
  this.setTint(0xFFFFFF, 0x000000, 2000);
};

module.exports = GlowEmitter;
