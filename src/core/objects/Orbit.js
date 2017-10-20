
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
  this.orbit = new engine.Circle(this.data.x/4, this.data.y/4, this.data.radius);
  this.circumference = this.orbit.circumference();
  
  this.center = {
    x: global.parseFloat(this.data.x),
    y: global.parseFloat(this.data.y)
  }
};

Orbit.CLOCK_RATE = 100;

Orbit.prototype.constructor = Orbit;

Orbit.prototype.update = function() {
  this.period += (this.parent.speed * this.throttle) / this.circumference * global.Math.PI;
  this.orbit.circumferencePoint(this.period, false, false, this.position);
  this.rotation += this.spin;
};

Orbit.prototype.pause = function() {
  this.stored = {
    period: this.period,
    rotation: this.rotation,
    throttle: this.throttle
  };
  this.throttle = 0; 
};

Orbit.prototype.compensated = function(rtt) {
  // var rtt = rtt || 0,
  //     position = this.position,
  //     last = this.last,
  //     relative = this.relative,
  //     direction = this.direction,
  //     modifier = (this.game.clock.time - this.time + rtt) / Movement.CLOCK_RATE;

  // if(this.magnitude > Movement.STOP_THRESHOLD) {
  //   relative.set(last.x, last.y);
  //   relative.interpolate(position, modifier, relative);
  //   relative.subtract(this.speed * direction.x, this.speed * direction.y);
  // } else {
  //   relative.set(position.x, position.y);
  // }

  // return relative;
};

Orbit.prototype.destroy = function() {
  this.parent = this.game = this.data = undefined;
};

module.exports = Orbit;
