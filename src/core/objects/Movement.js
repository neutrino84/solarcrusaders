
var engine = require('engine');

function Movement(parent) {
  this.parent = parent;
  this.game = parent.game;

  this.throttle = 0.0;
  this.rotation = global.Math.PI;
  this.magnitude = 0.0;
  
  this.start = {
    x: global.parseFloat(parent.data.x),
    y: global.parseFloat(parent.data.y)
  }
  
  this.position = new engine.Point(this.start.x, this.start.y);
  this.destination = new engine.Point();
  this.vector = new engine.Point();
  this.direction = new engine.Point();
  this.relative = new engine.Point();

  // this.test = this.game.clock.throttle(function(cross) {
  //   console.log(cross);
  // }, 500, this);
};

Movement.prototype.constructor = Movement;

Movement.prototype.update = function() {
  var parent = this.parent,
      destination = this.destination,
      position = this.position,
      vector = this.vector,
      direction = this.direction,
      speed, cross, dot;

  if(parent.disabled) {
    this.magnitude /= 1.04;
  }

  if(this.magnitude > 64.0) {
    this.throttle = global.Math.min(this.magnitude / 320.0, 1.0);

    speed = parent.speed * this.throttle;

    vector.set(destination.x, destination.y);
    vector.normalize();

    direction.set(
      global.Math.cos(this.rotation),
      global.Math.sin(this.rotation));

    // linear rotate
    dot = vector.dot(direction);
    cross = vector.cross(direction);
    if(cross > parent.evasion) {
      this.rotation -= parent.evasion;
    } else if(cross < -parent.evasion) {
      this.rotation += parent.evasion;
    } else if(dot < 0) {
      this.rotation -= parent.evasion
    }

    // linear speed
    position.add(
      speed * direction.x,
      speed * direction.y);
  } else {
    this.magnitude = 0.0;
    this.throttle = 0.0;
  }
};

Movement.prototype.compensated = function(rtt) {
  var rtt = rtt || 0,
      position = this.position,
      direction = this.direction,
      compensated = -this.parent.speed * this.throttle,
      relative = this.relative;
  return this.relative.setTo(
    position.x + direction.x * compensated,
    position.y + direction.y * compensated);
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
