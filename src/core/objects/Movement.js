
var engine = require('engine');

function Movement(parent) {
  this.parent = parent;
  this.game = parent.game;

  this.throttle = 0.0;
  this.rotation = -global.Math.PI/2;
  this.magnitude = 0.0;
  
  this.start = {
    x: global.parseFloat(parent.data.x),
    y: global.parseFloat(parent.data.y)
  }
  
  this.position = new engine.Point(this.start.x, this.start.y);
  this.destination = new engine.Point();
  this.vector = new engine.Point();
  this.direction = new engine.Point();

  // this.test = this.game.clock.throttle(function() {
  //   console.log(this.vector.cross(this.direction), this.vector.dot(this.direction));
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

  if(this.magnitude > 64.0) {
    this.throttle = global.Math.min(this.magnitude / 256.0, 1.0);

    speed = parent.speed * this.throttle;

    vector.set(destination.x, destination.y);
    vector.normalize();

    direction.set(
      global.Math.cos(this.rotation),
      global.Math.sin(this.rotation));

    // linear rotate
    dot = vector.dot(this.direction);
    cross = vector.cross(this.direction);
    if(cross > 0.1 || dot < 0.0) {
      this.rotation -= 0.1;
    } else if(cross < -0.1) {
      this.rotation += 0.1;
    }

    // linear speed
    position.add(
      speed * direction.x,
      speed * direction.y);
  } else {
    this.throttle = 0.0;
  }
};

Movement.prototype.plot = function(destination) {
  this.destination.copyFrom(destination);
  this.magnitude = this.destination.getMagnitude();
};

Movement.prototype.destroy = function() {
  //.. destroy
};

module.exports = Movement;
