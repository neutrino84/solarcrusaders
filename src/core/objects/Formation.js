
var engine = require('engine'),
    winston = require('winston');

function Formation(parent) {
  this.parent = parent;
  this.movement = parent.movement;

  this.squadron = [];
  this.circle = new engine.Circle();
  this.circle.radius = Formation.RADIUS;
};

Formation.RADIUS = 256;

Formation.prototype.constructor = Formation;

Formation.prototype.add = function(ship) {
  var squadron = this.squadron,
      index = squadron.indexOf(ship);
  if(index < 0) {
    squadron.push(ship);
  }
};

Formation.prototype.remove = function(ship) {
  var squadron = this.squadron,
      index = squadron.indexOf(ship);
  if(index >= 0) {
    squadron[index].master = null;
    squadron.splice(index, 1);
  }
};

Formation.prototype.disband = function() {
  var ship,
      squadron = this.squadron;
  for(var i=0; i<squadron.length; i++) {
    ship = squadron[i];
    ship.master = null;
  }
  squadron.length = 0;
};

Formation.prototype.position = function(ship, out) {
  var radians, index, speed,
      parent = this.parent,
      movement = this.movement,
      circle = this.circle,
      squadron = this.squadron,
      pi = global.Math.PI,
      length = squadron.length || parent.config.squadron.length;

  // find index
  if(typeof ship === 'object') {
    index = squadron.indexOf(ship);
  } else {
    index = ship+1;
  }
  if(movement && index >= 0) {
    // calculate radians
    radians = ((index/length)*pi) + (pi/length/2.0) + (pi/2.0) + (movement.rotation);

    // calculate offset speed
    speed = movement.speed * 6;

    // update circle
    circle.x = movement.position.x + movement.direction.x * speed;
    circle.y = movement.position.y + movement.direction.y * speed;
    circle.radius = Formation.RADIUS * ((movement.throttle * 0.25) + 0.75);

    // compute circumference point
    circle.circumferencePoint(radians, false, false, out);
  } else {
    winston.warn('[Formation] Squadron ship not found in formation');
  }
};

Formation.prototype.destroy = function() {
  var squadron = this.squadron;

  // unlink squadron
  for(var s in squadron) {
    this.remove(squadron[s]);
  }

  this.parent = this.movement = undefined;
};

module.exports = Formation;
