
var engine = require('engine');

function GlowEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 1000);

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

  this.setScale(0.0, ship.data.size / 16, 250);
  this.setTint(0xFFFFFF, 0x000000, 1000);
};

GlowEmitter.prototype.explosion = function(object) {
  var movement = object.movement, speed;
    if(movement){
      speed = movement._speed * 2,
      vector = movement._vector;
    } else {
      speed = object.speed,
      vector = object.vector;
    };

  this.lifespan = 2000;

  this.setVelocity(speed * 2, speed * 2);
  this.setVector(vector.x, vector.y);

  this.setScale(1.0, object.data.size * 1.5, 1000);
  this.setAlpha(0.4, 0, 2000);
  // this.setAlpha(0.0, 0.2, 2000);
  this.setTint(0xFFffff, 0x999999, 2000);
};

module.exports = GlowEmitter;
