
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
};

Orbit.prototype.constructor = Orbit;

Orbit.prototype.update = function() {
  
};

Orbit.prototype.compensated = function(rtt) {

};

Orbit.prototype.destroy = function() {
  //.. destroy
};

module.exports = Orbit;
