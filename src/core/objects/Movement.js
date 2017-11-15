
var engine = require('engine');

function Movement(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.data = parent.data;

  this.time = null;
  this.formation = null;
  this.friction = null;
  this.magnitude = 0;
  this.throttle = this.data.throttle;
  this.speed = this.data.speed;
  this.rotation = this.data.rotation;

  this.start = {
    x: global.parseFloat(this.data.x),
    y: global.parseFloat(this.data.y)
  };

  this.circle = new engine.Circle();
  this.last = new engine.Point(this.start.x, this.start.y);
  this.position = new engine.Point(this.start.x, this.start.y);
  this.destination = new engine.Point();
  this.vector = new engine.Point();
  this.direction = new engine.Point();
  this.relative = new engine.Point();
};

Movement.CLOCK_RATE = 100;
Movement.IDLE_TIMEOUT_MS = 6000;
Movement.FRICTION_DISABLED = 0.98;
Movement.FRICTION_IDLED = 0.96;
Movement.FRICTION_THRESHOLD = 0.24;
Movement.STOP_THRESHOLD = 32;
Movement.THROTTLE_THRESHOLD = 256;
Movement.FORMATION_STOP_THRESHOLD = 16;
Movement.FORMATION_THROTTLE_THRESHOLD = 128;
Movement.FORMATION_THROTTLE_MODIFIER = 64;

Movement.prototype.constructor = Movement;

Movement.prototype.stop = function() {
  this.magnitude = 0;
  this.throttle = 0;
};

Movement.prototype.plot = function(destination, throttle) {
  if(!this.formation && !this.parent.disabled) {
    // copy destination trajectory
    this.destination.copyFrom(destination);
    this.magnitude = this.destination.getMagnitude();
    this.throttle = throttle ? throttle : engine.Math.clamp(this.magnitude/Movement.THROTTLE_THRESHOLD, 0.0, 1.0);

    // check if stopping
    // and handle idle timer
    this.timer && this.game.clock.events.remove(this.timer);
    if(this.magnitude <= Movement.STOP_THRESHOLD) {
      this.stop();
    } else {
      this.timer = this.game.clock.events.add(Movement.IDLE_TIMEOUT_MS, this.idled, this);
    }
  }
};

Movement.prototype.idled = function() {
  this.friction = Movement.FRICTION_IDLED;
};

Movement.prototype.update = function() {
  var parent = this.parent,
      last = this.last,
      position = this.position,
      vector = this.vector,
      destination = this.destination,
      direction = this.direction,
      formation = this.formation,
      evasion = parent.evasion,
      maneuver, cross, dot,
      ev, throttle;

  // time compensation
  this.time = this.game.clock.time;

  // check if in formation
  if(formation) {
    // get trajectory
    destination.copyFrom(formation.position(parent.uuid));
    destination.subtract(position.x, position.y);

    // set magnitude and throttle
    this.magnitude = destination.getMagnitude();
    if(this.magnitude > Movement.FORMATION_STOP_THRESHOLD) {
      // calculate optimal throttle
      throttle = Movement.FORMATION_THROTTLE_THRESHOLD +
        ((1-formation.movement.throttle) * Movement.FORMATION_THROTTLE_MODIFIER);

      // set local throttle
      this.throttle = engine.Math.clamp(this.magnitude/throttle, 0.0, 1.0);
    } else {
      this.stop();
    }
  }

  // friction
  if(parent.disabled) {
    this.throttle *= Movement.FRICTION_DISABLED;
  } else if(this.friction) {
    if(this.throttle > Movement.FRICTION_THRESHOLD) {
      this.throttle *= this.friction;
    } else {
      this.throttle = 0;
    }
  }

  // update ship position
  if(this.throttle > 0) {
    // set movement speed
    this.speed = parent.speed * this.throttle;
    
    // normalize vector
    vector.set(destination.x, destination.y);
    vector.normalize();

    // linear rotate
    if(!vector.isZero()) {

      // maneuverability
      ev = evasion/2;
      maneuver = (ev/this.throttle)+ev;

      // head towards direction
      direction.set(
        global.Math.cos(this.rotation),
        global.Math.sin(this.rotation));

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
      
      // last position
      last.set(position.x, position.y);

      // linear speed
      position.add(
        this.speed * direction.x, 
        this.speed * direction.y);
    }
  } else {
    // set movement speed
    this.speed = 0;
    this.friction = null;
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

Movement.prototype.destroy = function() {
  //.. destroy
};

module.exports = Movement;
