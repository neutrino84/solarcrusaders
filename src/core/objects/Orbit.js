
var engine = require('engine');

function Orbit(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.data = parent.data;

  this.speed = 0.0;
  this.throttle = this.data.throttle;
  this.period = this.data.period;
  this.rotation = this.data.rotation;
  this.spin = this.data.spin;

  this.previous = new engine.Point();
  this.position = new engine.Point();
  this.orbit = new engine.Circle(this.data.x, this.data.y, this.data.radius);
  this.orbit.circumferencePoint(this.period, false, false, this.position);
  this.circumference = this.orbit.circumference();
};

Orbit.prototype.constructor = Orbit;

Orbit.prototype.stop = function() {
  this.throttle = 0.0;
  this.spin = 0.0;
};

Orbit.prototype.disabled = function() {
  this.throttle = 0.5;
  this.spin = this.data.spin*0.5;
};

Orbit.prototype.update = function() {
  this.speed = this.parent.speed / this.circumference * global.Math.PI * this.throttle;
  this.period += this.speed;
  this.previous.set(this.position.x, this.position.y);
  this.orbit.circumferencePoint(this.period, false, false, this.position);
  this.rotation += this.spin;
};

Orbit.prototype.compensated = function(rtt) {
  return this.previous;
};

Orbit.prototype.destroy = function() {
  this.parent = this.game = this.data = undefined;
};

module.exports = Orbit;
