
var engine = require('engine');

function Orbit(parent) {
  this.parent = parent;
  this.game = parent.game;

  this.speed = parent.data.speed;
  this.rotation = global.Math.PI * global.Math.random();
  this.time = this.game.clock.time;
  

  this.center = {
    x: global.parseFloat(parent.data.x),
    y: global.parseFloat(parent.data.y)
  };

  if(parent.radius){
    this.radius = parent.radius;
  }

  this.period = 0;

  this.circle = new engine.Circle(this.center.x/4, this.center.y/4, this.parent.data.radius*1.5);

  this.last = new engine.Point(this.center.x, this.center.y);
  this.position = new engine.Point();
  this.relative = new engine.Point();
  this.destination = new engine.Point();
  this.vector = new engine.Point();
  this.direction = new engine.Point();
  this.stabilization = new engine.Point();

  this.circle.circumferencePoint(this.period, false, false, this.position);
}
 
Orbit.CLOCK_RATE = 100;
Orbit.FRICTION = 1.2;
Orbit.STOP_THRESHOLD = 32.0;
Orbit.THROTTLE_THRESHOLD = 256.0;

Orbit.prototype.constructor = Orbit;

Orbit.prototype.update = function() {
  var delta = this.speed * (1/60) * (1/100);
  this.period += delta;
  if(this.parent.chassis === 'ubadian-station-x01'){
    this.circle.circumferencePoint(this.period, false, false, this.position);
  }
};

Orbit.prototype.compensated = function(rtt) {
  // console.log('(',this.center.x, this.center.y,')' , this.position);
};

Orbit.prototype.destroy = function() {
  //.. destroy
};

module.exports = Orbit;
