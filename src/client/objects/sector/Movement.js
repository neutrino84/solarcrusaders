
var engine = require('engine');

function Movement(parent) {
  this.parent = parent;
  this.game = parent.game;

  this._speed = 0;
  this._velocity = 0;

  this._destination = new engine.Point();
  this._position = new engine.Point();
  this._vector = new engine.Point();
  this._direction = new engine.Point();

  this.velocity = 0;

  // this._move = this.game.clock.throttle(this.move, 100, this);
  // this._test = this.game.clock.throttle(function() {

  // }, 2000, this);
}

Movement.prototype.constructor = Movement;

// Movement.prototype.move = function() {
//   var ship = this.parent,
//       vector = this._vector,
//       temp = this._temp,
//       manager = ship.manager,
//       start = manager.shipsGroup.worldTransform.apply(ship.position, temp),
//       end = this.game.input.mousePointer,
//       destination = { x: end.x - start.x, y: end.y - start.y };

//   // normalize destination
//   temp.copyFrom(destination).normalize();

//   // plot vector to server
//   if((engine.Math.floorTo(vector.x, 2) !== engine.Math.floorTo(temp.x, 2)) || (
//       engine.Math.floorTo(vector.y, 2) !== engine.Math.floorTo(temp.y, 2))) {
//     manager.socket.emit('ship/plot', {
//       uuid: ship.uuid,
//       destination: destination
//     });
//   }
// };

Movement.prototype.update = function() {
  var position = this._position,
      destination = this._destination,
      vector = this._vector,
      direction = this._direction,
      speed = this._speed,
      velocity = this._velocity,
      ship = this.parent,
      distance, a1, a2;

  // ship position to point
  position.set(ship.position.x, ship.position.y);

  // calculate distance
  distance = position.distance(destination);

  if(speed > 0 && speed * 2.0 < distance) {
    velocity *= 2.0;
  } else if(speed == 0 && distance > 1.0) {
    velocity = distance/4;
  }
  
  // calculate vector
  vector.set(destination.x - position.x, destination.y - position.y);
  vector.normalize();

  // update direction
  direction.interpolate({
    x: vector.x * velocity,
    y: vector.y * velocity }, 0.25, direction);

  // update ship position
  ship.position.set(position.x + direction.x, position.y + direction.y);

  // update rotation
  if(velocity > 0 && speed > 0) {
    a1 = position.y - ship.position.y;
    a2 = position.x - ship.position.x;
    if(a1 !== 0 && a2 !== 0) {
      ship.rotation = global.Math.atan2(a1, a2);
    } else {
      ship.rotation = 0;
    }
  }
};

Movement.prototype.plot = function(data) {
  var ship = this.parent,
      clock = this.game.clock,
      time = clock.time,
      frames = clock.frames,
      fps = ship.isPlayer && frames > 180 ? clock.fps : 60,
      a1, a2,
      distance;

  this._destination.copyFrom(data.pos);
  this._speed = data.spd;
  this._velocity = (data.spd / (1/10)) * (1/fps);

  // set velocity
  this.velocity = this._velocity * 6;
};

Movement.prototype.destroy = function() {
  this.parent = this.game =
    this._destination = this._origin = this._position =
    this._vector = this._direction = undefined;
};

module.exports = Movement;
