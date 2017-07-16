
var engine = require('engine');

function Orbit(parent) {
  this.parent = parent;
  this.game = parent.game;

  this.speed = 0.0;
  this.rotation = global.Math.PI * global.Math.random();
  this.time = this.game.clock.time;
  
  this.center = {
    x: global.parseFloat(parent.data.x),
    y: global.parseFloat(parent.data.y)
  }

  this.last = new engine.Point(this.center.x, this.center.y);
  this.position = new engine.Point(this.center.x, this.center.y);
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
  
};

Orbit.prototype.compensated = function(rtt) {

};

Orbit.prototype.destroy = function() {
  //.. destroy
};

module.exports = Orbit;
