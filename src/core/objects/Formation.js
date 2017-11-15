
var engine = require('engine');

function Formation(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.data = parent.data;
  this.config = parent.config;
  this.movement = parent.movement;

  // formation position asignments
  // tracked by squadron ship uuid
  this.assignments = [];

  this.point = new engine.Point();
  this.circle = new engine.Circle(this.data.x, this.data.y, this.data.size * 5.0);
};

Formation.prototype.constructor = Formation;

Formation.prototype.add = function(uuid) {
  this.assignments.push(uuid);
};

Formation.prototype.position = function(uuid) {
  var config = this.config,
      circle = this.circle,
      movement = this.movement,
      point = this.point,
      assignments = this.assignments,
      index = assignments.indexOf(uuid),
      radians;

  // if uuid found
  if(index >= 0) {
    // calculate position
    radians = ((index+1) * (global.Math.PI/config.squadron.length)) + movement.rotation + global.Math.PI/3;

    // copy current
    // ship position
    circle.x = movement.position.x;
    circle.y = movement.position.y;

    return circle.circumferencePoint(radians, false, false, point);
  } else {
    return null;
  }
};

Formation.prototype.destroy = function() {
  this.parent = this.game = this.data =
    this.config = this.movement = undefined;
};

module.exports = Formation;
