
var engine = require('engine');

function Trails(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.trajectoryGroup = parent.manager.trajectoryGroup;

  this.numOfPoints = 12;
};

Trails.prototype.constructor = Trails;

Trails.prototype.create = function() {
  var points = this.points = [],
      parent = this.parent,
      config = parent.config.engine.trail,
      center = game.world.worldTransform.applyInverse(parent.worldTransform.apply(config.position));

  for(var i=0; i<this.numOfPoints; i++) {
    points.push(new engine.Point(center.x, center.y));
  }

  this.trail = new engine.Strip(this.game, 'trails', points);
  this.trail.scale.set(config.scale.x, config.scale.y);
  this.trail.tint = 0x336699;
  this.trail.alpha = 1.0;
  this.trail.blendMode = engine.BlendMode.ADD;

  this.trajectoryGroup.addChild(this.trail);
};

Trails.prototype.update = function() {
  var trail = this.trail,
      parent = this.parent,
      points = this.points,
      len = this.numOfPoints,
      config = parent.config.engine.trail,
      worldTransform = this.game.world.worldTransform,
      center = game.world.worldTransform.applyInverse(parent.worldTransform.apply(config.position));
  for(var i=0; i<len; i++) {
    points[i].interpolate(center, (i*2) * 0.0075, points[i]);
  }
  points[len-1].set(center.x, center.y);
  points[len-2].set(center.x, center.y);
};

module.exports = Trails;
