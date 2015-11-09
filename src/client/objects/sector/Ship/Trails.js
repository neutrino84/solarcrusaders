
var engine = require('engine'),
    Movement = require('../Movement');

function Trails(parent) {
  this.parent = parent;

  this.trails = [];
  this.numOfPoints = 6;
};

Trails.prototype.constructor = Trails;

Trails.prototype.create = function() {
  var points, trail,
      parent = this.parent,
      config = parent.config.engine.trails;

  for(var t in config) {
    points = [];

    for(var i=0; i<this.numOfPoints; i++) {
      points.push(new engine.Point(i * 1, 0));
    }

    trail = new engine.Strip(parent.game, 'engine-glow', null, points);
    trail.position.set(config[t].position.x, config[t].position.y);
    trail.scale.set(0.15 / parent.config.size, 0.15 / parent.config.size);
    trail.rotation = -parent.rotation;
    trail.alpha = 0.6;

    this.trails.push(trail);

    parent.addChild(trail);
  }
};

Trails.prototype.update = function() {
  var trail, vector,
      trails = this.trails,
      parent = this.parent,
      config = parent.config.engine.trails;
  if(trails.length > 0) {
    for(var s in this.trails) {
      
      trail = this.trails[s];

      vector = parent.movement.vector;
      vector.multiply(Movement.FRAMERATE / 12, Movement.FRAMERATE / 12);

      if(vector.x !== 0 && vector.y !== 0) {
        trail.rotation = -parent.movement.angle;
      }

      for(var i=this.numOfPoints-1; i>=0; i--) {
        if(i === this.numOfPoints-1) {
          continue;
        } else {
          trail.points[i].subtract(vector.x, vector.y);
          engine.Point.interpolate(trail.points[i], trail.points[i+1], 0.15, trail.points[i]);
        }
      }
    }
  }
};

module.exports = Trails;
