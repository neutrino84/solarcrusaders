
var engine = require('engine');

function Movement(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.data = parent.data;

  this.started = 0;
  this.speed = 0;
  this.rotation = this.data.rotation;
  this.throttle = this.data.throttle;

  this.previous = new engine.Point(this.data.x, this.data.y);
  this.position = new engine.Point(this.data.x, this.data.y);
  this.destination = new engine.Point();
  this.vector = new engine.Point();
  this.direction = new engine.Point();
};

Movement.DELTA_THRESHOLD = 0.0001;
Movement.DELTA_COEFFICIENT = 0.26;
Movement.DISABLED_DELTA_COEFFICIENT = 0.024;
Movement.THROTTLE_THRESHOLD = 256;

Movement.prototype.constructor = Movement;

Movement.prototype.stop = function() {
  this.throttle = 0;
};

Movement.prototype.plot = function(vector, throttle) {
  var size = this.data.size,
      a = vector.x * vector.x,
      b = vector.y * vector.y,
      magnitude = global.Math.sqrt(a + b);

  if(!this.parent.disabled) {
    // set throttle
    if(throttle) {
      this.throttle = throttle;
    } else if(magnitude<=size) {
      this.throttle = 0.0;
    } else {
      this.throttle = global.Math.min(magnitude/Movement.THROTTLE_THRESHOLD, 1.0);
    }

    // set a destination
    // if there is throttle
    if(this.throttle > 0.0) {
      this.vector.set(vector.x, vector.y);
    }
  }
};

Movement.prototype.update = function() {
  var parent = this.parent,
      previous = this.previous,
      position = this.position,
      vector = this.vector,
      direction = this.direction,
      lerp = parent.speed*this.throttle-this.speed,
      coefficient = parent.disabled ?
        Movement.DISABLED_DELTA_COEFFICIENT :
        Movement.DELTA_COEFFICIENT,
      maneuver, cross, dot;

  // update time
  this.started = this.game.clock.time;

  // calculate speed
  if(global.Math.abs(lerp) > Movement.DELTA_THRESHOLD) {
    this.speed += lerp * coefficient;
  }

  // update ship position
  if(this.speed > 0.0) {
    // normalize
    vector.normalize();

    // calculate maneuverability
    maneuver = parent.evasion;

    // calculate new rotation
    dot = vector.dot(direction);
    cross = vector.cross(direction);
    if(cross > maneuver) {
      this.rotation -= maneuver;
    } else if(cross < -maneuver) {
      this.rotation += maneuver;
    } else if(dot < 0) {
      this.rotation -= maneuver
    }

    // direction
    direction.set(
      global.Math.cos(this.rotation),
      global.Math.sin(this.rotation));

    // set last position
    previous.copyFrom(position);

    // linear speed
    position.add(
      direction.x * this.speed, 
      direction.y * this.speed);
  }
};

Movement.prototype.compensated = function(rtt) {
  var rtt = rtt || 0,
      game = this.game,
      previous = this.previous,
      position = this.position,
      elapsed;
  
  // calculate compensation
  elapsed = game.clock.time - this.started;
  previous = previous.interpolate(position, elapsed/100);

  return previous;
};

Movement.prototype.destroy = function() {
  this.parent = this.game = this.data = undefined;
};

module.exports = Movement;
