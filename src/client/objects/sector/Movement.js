
var engine = require('engine');

function Movement(parent) {
  this.parent = parent;
  this.game = parent.game;

  this.speed = 0;
  this.velocity = 0;
  this.throttle = 0;

  this.vector = new engine.Point();
  this.position = new engine.Point();
  this.destination = new engine.Point();
  this.direction = new engine.Point();
}

Movement.prototype.constructor = Movement;

Movement.prototype.update = function() {
  var position = this.position,
      destination = this.destination,
      vector = this.vector,
      direction = this.direction,
      speed = this.speed,
      velocity = this.velocity,
      ship = this.parent,
      distance, a1, a2;

  // ship position to point
  position.set(ship.position.x, ship.position.y);

  // calculate distance
  distance = position.distance(destination);

  if(speed * 2.0 < distance) {
    velocity *= 2.0;
  }
  
  // calculate vector
  vector.set(destination.x - position.x, destination.y - position.y);
  vector.normalize();

  // update direction
  direction.interpolate({
    x: vector.x * velocity,
    y: vector.y * velocity }, 0.25, direction);

  // calculate throttle
  this.throttle = direction.getMagnitude() * 6 / speed;

  // update ship position
  ship.position.set(position.x + direction.x, position.y + direction.y);

  // update rotation
  if(!ship.disabled && velocity > 0) {
    a1 = position.y - ship.position.y;
    a2 = position.x - ship.position.x;

    if(a1 !== 0 && a2 !== 0) {
      ship.rotation = global.Math.atan2(a1, a2);
    } else {
      ship.rotation = 0;
    }
  }

  if(ship.disabled && velocity > 0) {
    ship.rotation += velocity/100;
  }
};

Movement.prototype.plot = function(data) {
  this.destination.copyFrom(data.pos);
  this.speed = data.spd;
  this.velocity = (data.spd / (1/10)) * (1/60);
};

Movement.prototype.destroy = function() {
  this.parent = this.game =
    this.destination = this.position =
    this.vector = this.direction = undefined;
};

module.exports = Movement;
