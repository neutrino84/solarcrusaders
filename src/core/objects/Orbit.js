
var engine = require('engine');

function Orbit(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.data = parent.data;

  this.throttle = this.data.throttle;
  this.period = this.data.period;
  this.rotation = this.data.rotation;
  this.spin = this.data.spin;

  this.position = new engine.Point();
  this.orbit = new engine.Circle(this.data.x, this.data.y, this.data.radius);
  this.circumference = this.orbit.circumference();
  
  this.center = {
    x: global.parseFloat(this.data.x),
    y: global.parseFloat(this.data.y)
  }
};

Orbit.prototype.constructor = Orbit;

Orbit.prototype.update = function() {
  this.period += (this.parent.speed * this.throttle) / this.circumference * global.Math.PI;
  this.orbit.circumferencePoint(this.period, false, false, this.position);
  this.rotation += this.spin;
};

Orbit.prototype.compensated = function(rtt) {

};

Orbit.prototype.destroy = function() {
  this.parent = this.game = this.data = undefined;
};

module.exports = Orbit;
