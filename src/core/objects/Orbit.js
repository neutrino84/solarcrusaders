
var engine = require('engine');

function Orbit(parent) {
  this.parent = parent;
  this.game = parent.game;
  // console.log('THIS.PARENT.data IS ', this.parent.data.x, this.parent.data.y)
  this.speed = 0.0;
  this.rotation = global.Math.PI * global.Math.random();
  this.time = this.game.clock.time;
  

  this.center = {
    x: global.parseFloat(parent.data.x),
    y: global.parseFloat(parent.data.y)
  }
  if(parent.radius){
    this.radius = parent.radius;
    // console.log(this.radius)
  }

  this.orbit = new engine.Circle(this.parent.data.x, this.parent.data.y, this.radius);
  console.log('this.orbit is ', this.orbit)
  this.position = new engine.Point(this.center.x+this.radius, this.center.y+this.radius);
  this.last = new engine.Point(this.center.x, this.center.y);
  this.destination = new engine.Point();
  this.vector = new engine.Point();
  this.direction = new engine.Point();
  this.relative = new engine.Point();
  this.stabilization = new engine.Point();
};
 
Orbit.CLOCK_RATE = 100;
Orbit.FRICTION = 1.2;
Orbit.STOP_THRESHOLD = 32.0;
Orbit.THROTTLE_THRESHOLD = 256.0;

Orbit.prototype.constructor = Orbit;

Orbit.prototype.update = function() {
  // console.log(this.parent)
  if(this.position){
    // console.log(this.position);   
  } else {
    console.log('orbit position undefined. this is', this)
  }
  this.orbit.circumferencePoint(this.parent.data.period, false, false, this.position);
};

Orbit.prototype.compensated = function(rtt) {
  var rtt = rtt || 0,
      position = {x: this.parent.data.x, y: this.parent.data.y},
      last = this.last,
      relative = this.relative,
      direction = this.direction,
      modifier = (this.game.clock.time - this.time + rtt) / Orbit.CLOCK_RATE;

  if(this.magnitude > Orbit.STOP_THRESHOLD) {
    relative.set(last.x, last.y);
    relative.interpolate(position, modifier, relative);
    relative.subtract(this.speed * direction.x, this.speed * direction.y);
  } else {
    relative.set(position.x, position.y);
  }
  return relative;
};

Orbit.prototype.destroy = function() {
  //.. destroy
};

module.exports = Orbit;
