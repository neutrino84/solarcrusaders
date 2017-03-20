
var engine = require('engine');

function Movement(parent) {
  this.parent = parent;
  this.game = parent.game;

  this.throttle = 0.0;
  this.magnitude = 0.0;
  this.speed = 0.0;
  this.rotation = global.Math.PI * global.Math.random();
  this.time = this.game.clock.time;
  
  this.start = {
    x: global.parseFloat(parent.data.x),
    y: global.parseFloat(parent.data.y)
  }

  this.last = new engine.Point(this.start.x, this.start.y);
  this.position = new engine.Point(this.start.x, this.start.y);
  this.destination = new engine.Point();
  this.vector = new engine.Point();
  this.direction = new engine.Point();
  this.relative = new engine.Point();
};

Movement.CLOCK_RATE = 100;
Movement.FRICTION = 1.1;
Movement.STOP_THRESHOLD = 32.0;
Movement.THROTTLE_THRESHOLD = 192.0;
Movement.THROTTLE_MANEUVER = 1.25;

Movement.prototype.constructor = Movement;

Movement.prototype.update = function() {
  var parent = this.parent,
      destination = this.destination,
      last = this.last,
      position = this.position,
      vector = this.vector,
      direction = this.direction,
      evasion = parent.evasion,
      maneuver, cross, dot;

  // time compensation
  this.time = this.game.clock.time;

  // magnitude friction
  if(parent.disabled) {
    this.magnitude /= Movement.FRICTION;
  }

  if(this.magnitude > Movement.STOP_THRESHOLD) {
    this.throttle = global.Math.min(this.magnitude/Movement.THROTTLE_THRESHOLD, 1.0);
    this.speed = parent.speed * this.throttle;

    vector.set(destination.x, destination.y);
    vector.normalize();

    if(!vector.isZero()) {
      // maneuverability
      maneuver = evasion/(this.throttle*Movement.THROTTLE_MANEUVER);

      direction.set(
        global.Math.cos(this.rotation),
        global.Math.sin(this.rotation));

      // linear rotate
      dot = vector.dot(direction);
      cross = vector.cross(direction);
      if(cross > maneuver) {
        this.rotation -= maneuver;
      } else if(cross < -maneuver) {
        this.rotation += maneuver;
      } else if(dot < 0) {
        this.rotation -= maneuver
      }

      // last position
      last.set(position.x, position.y);

      // linear speed
      position.add(
        this.speed * direction.x,
        this.speed * direction.y);
    }
  } else {
    this.magnitude = 0.0;
    this.throttle = 0.0;
    this.speed = 0.0;
  }
};

Movement.prototype.compensated = function(rtt) {
  var rtt = rtt || 0,
      position = this.position,
      last = this.last,
      relative = this.relative,
      direction = this.direction,
      modifier = (this.game.clock.time - this.time + rtt) / Movement.CLOCK_RATE;

  if(this.magnitude > Movement.STOP_THRESHOLD) {
    relative.set(last.x, last.y);
    relative.interpolate(position, modifier, relative);
    relative.subtract(this.speed * direction.x, this.speed * direction.y);
  } else {
    relative.set(position.x, position.y);
  }

  return relative;
};

Movement.prototype.plot = function(destination, magnitude) {
  if(!this.parent.disabled) {
    this.destination.copyFrom(destination);
    this.magnitude = magnitude ? magnitude : this.destination.getMagnitude();
  }
};

Movement.prototype.destroy = function() {
  //.. destroy
};

module.exports = Movement;
