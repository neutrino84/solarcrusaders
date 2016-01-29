
var engine = require('engine');

function Trail(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.trajectoryGroup = parent.manager.trajectoryGroup;

  this.numOfPoints = 8;
};

Trail.prototype.constructor = Trail;

Trail.prototype.create = function() {
  var points = this.points = [],
       center, parent = this.parent,
      config = parent.config.engine.trail;
  if(config) {
    center = game.world.worldTransform.applyInverse(parent.worldTransform.apply(config.position));

    for(var i=0; i<this.numOfPoints; i++) {
      points.push(new engine.Point(center.x, center.y));
    }

    this.trail = new engine.Strip(this.game, 'trails', points);
    this.trail.scale.set(config.scale.x, config.scale.y);
    this.trail.blendMode = engine.BlendMode.ADD;
    this.trail.alpha = 0.75;

    this.trajectoryGroup.add(this.trail);
  }
};

Trail.prototype.update = function() {
  var pos, center, trail = this.trail,
      parent = this.parent,
      points = this.points,
      len = this.numOfPoints,
      config = parent.config.engine.trail,
      worldTransform = this.game.world.worldTransform;
  if(config) {
    center = worldTransform.applyInverse(parent.worldTransform.apply(config.position))
    for(var i=0; i<len; i++) {
      if(i == len-1) {
        pos = center;
      } else {
        pos = points[i+1];
      }
      points[i].interpolate(pos, (i*2) * 0.015, points[i]);
    }
  }
};

Trail.prototype.destroy = function() {
  this.trajectoryGroup.remove(this.trail);

  this.trail = this.points = this.parent =
    this.game = this.trajectoryGroup = undefined;
};

module.exports = Trail;
