
var engine = require('engine');

function Movement(ship) {
  this.ship = ship;
  this.game = ship.game;

  this.speed = 0.0;
  this.step = 0.0;

  this.vector = new engine.Point();
  this.direction = new engine.Point();
  this.position = new engine.Point(ship.data.x, ship.data.y);
  this.destination = new engine.Point(ship.data.x, ship.data.y);
};

Movement.STEP_SIZE = 10/60;
Movement.INTERPOLATION = 0.18;
Movement.COMPENSATE = 0.24;

Movement.prototype.constructor = Movement;

Movement.prototype.update = function() {
  var position = this.position,
      destination = this.destination,
      vector = this.vector,
      direction = this.direction,
      step = this.step,
      speed = this.speed,
      ship = this.ship,
      a1, a2, compensate;

  // throttle
  this.throttle = position.distance(ship.position)/(ship.config.stats.speed*Movement.STEP_SIZE);

  // position
  position.copyFrom(ship.position);

  // calculate vector
  vector.set(destination.x - ship.position.x, destination.y - ship.position.y);
  vector.normalize();
  vector.multiply(step, step);

  // interpolate step
  direction.interpolate(vector, Movement.INTERPOLATION, direction);

  // update ship position
  ship.position.set(
    ship.position.x + vector.x,
    ship.position.y + vector.y);

  // update rotation
  if(speed > 0.0) {
    a1 = -direction.y;
    a2 = -direction.x;

    if(a1 !== 0 && a2 !== 0) {
      ship.rotation = global.Math.atan2(a1, a2);
    }
  }
};

Movement.prototype.plot = function(data) {
  var step = 10/global.Math.max(this.game.clock.fps, 34), //Movement.STEP_SIZE,
      compensate = Movement.COMPENSATE,
      compensation = engine.Point.interpolate(this.ship.position, data.cmp, compensate);

  // speed and step
  this.speed = data.spd;
  this.step = data.spd*step;
  this.destination.set(data.pos.x, data.pos.y);

  // compensate ship
  // position and apply
  this.ship.position.copy(compensation);
};

Movement.prototype.destroy = function() {
  this.ship = this.game = undefined;
};

module.exports = Movement;
