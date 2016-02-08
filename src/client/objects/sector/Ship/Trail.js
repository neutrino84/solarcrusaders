
var engine = require('engine');

function Trail(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.trajectoryGroup = parent.manager.trajectoryGroup;

  this._tempPoint = new engine.Point();

  this.numOfPoints = 12;
};

Trail.prototype.constructor = Trail;

Trail.prototype.create = function() {
  var points = this.points = [],
      parent = this.parent,
      config = parent.config.engine.trail;
  if(config) {
    for(var i=0; i<this.numOfPoints; i++) {
      points.push(new engine.Point(parent.x + (i * 20), parent.y));
    }

    this.trail = new engine.Strip(this.game, 'trails', points);
    this.trail.blendMode = engine.BlendMode.ADD;

    // wait to add
    this.game.clock.events.add(1000, function() {
      // TODO: this is faulty
      // ..
      this.trajectoryGroup.add(this.trail);
    }, this);

    parent.on('enterBounds', this.enterBounds, this);
    parent.on('exitBounds', this.exitBounds, this);
  }
};

Trail.prototype.enterBounds = function() {
  this.trajectoryGroup.add(this.trail);
};

Trail.prototype.exitBounds = function() {
  this.trajectoryGroup.remove(this.trail);
};

Trail.prototype.update = function() {
  var pos, center, trail = this.trail,
      parent = this.parent,
      points = this.points,
      len = this.numOfPoints,
      config = parent.config.engine.trail,
      worldTransform = this.game.world.worldTransform,
      vector;
  if(config) {
    center = worldTransform.applyInverse(parent.worldTransform.apply(config.position, this._tempPoint), this._tempPoint);
    for(var i=len-1; i>=0; i--) {
      if(i==len-1) {
        points[i].set(center.x, center.y);
      } else if(i==len-2) {
        vector = parent.movement.vector;
        points[i].set(center.x-vector.x * 2.0, center.y-vector.y * 2.0);
      } else {
        vector = parent.movement.vector;
        pos = points[i+1];
        pos.subtract(vector.x * 1.0, vector.y * 1.0);
        points[i].interpolate(pos, 0.15, points[i]);
      }
    }
  }
};

Trail.prototype.destroy = function() {
  this.trajectoryGroup.remove(this.trail);

  this.parent.removeListener('enterBounds', this.enterBounds);
  this.parent.removeListener('exitBounds', this.exitBounds);

  this.trail = this.points = this.parent =
    this.game = this.trajectoryGroup = undefined;
};

module.exports = Trail;
