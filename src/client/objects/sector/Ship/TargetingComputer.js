
var engine = require('engine'),
    Hardpoint = require('../Hardpoint');

function TargetingComputer(parent, config) {
  this.parent = parent;
  this.game = parent.game;
  this.config = config;

  this.hardpoints = [];
  this.enhancements = {};

  this.target = new engine.Point();

  // attack rate locked at
  // 500ms but will be dynamic
  this.fire = this.game.clock.throttle(this.fired, 500, this, true);
};

TargetingComputer.prototype.constructor = TargetingComputer;

TargetingComputer.prototype.create = function() {
  var hardpoint, config, data, slot,
      parent = this.parent,
      hardpoints = parent.details.hardpoints;
  for(var h in hardpoints) {
    slot = hardpoints[h].slot;

    hardpoint = new Hardpoint(this, hardpoints[h], this.config.hardpoints[slot]);
    hardpoint.fxGroup = parent.manager.fxGroup;
    hardpoint.flashEmitter = parent.manager.flashEmitter;
    hardpoint.explosionEmitter = parent.manager.explosionEmitter;
    hardpoint.glowEmitter = parent.manager.glowEmitter;
    hardpoint.fireEmitter = parent.manager.fireEmitter;

    this.hardpoints.push(hardpoint);
  }
};

TargetingComputer.prototype.attack = function(target) {
  var hardpoints = this.hardpoints,
      parent = this.parent,
      length = hardpoints.length,
      distance;
  if(length > 0) {
    // update target
    this.target.set(target.x, target.y);

    // distance
    distance = engine.Point.distance(parent.position, this.target);

    // display
    for(var i=0; i<length; i++) {
      hardpoints[i].fire(distance);
    }
  }
};

TargetingComputer.prototype.fired = function(target) {
  var game = this.game,
      parent = this.parent,
      hardpoints = this.hardpoints,
      socket = parent.manager.socket,
      details = parent.details,
      distance;
  if(hardpoints.length > 0) {
    game.world.worldTransform.applyInverse(target, this.target);
    distance = engine.Point.distance(parent.position, this.target);
    
    // check range
    if(distance > details.range) {
      engine.Line.pointAtDistance(parent.position, this.target, details.range, this.target);
      distance = details.range;
    }
    
    // server
    socket.emit('ship/attack', {
      uuid: parent.uuid,
      targ: {
        x: this.target.x,
        y: this.target.y
      }
    });

    // display
    for(var i=0; i<hardpoints.length; i++) {
      hardpoints[i].fire(distance);
    }
  }
};

TargetingComputer.prototype.enhance = function(name, state) {
  this.enhancements[name] = state;
};

TargetingComputer.prototype.enhanced = function(name) {
  return this.enhancements[name];
};

TargetingComputer.prototype.update = function() {
  var hardpoints = this.hardpoints,
      length = hardpoints.length;
  if(length > 0) {
    for(var h in hardpoints) {
      hardpoints[h].update();
    }
  }
};

TargetingComputer.prototype.destroy = function() {
  var hardpoint,
      hardpoints = this.hardpoints;
  
  for(var h in hardpoints) {
    hardpoint = hardpoints[h];
    hardpoint.destroy();
    hardpoint.fxGroup =
      hardpoint.flashEmitter =
      hardpoint.explosionEmitter =
      hardpoint.glowEmitter = undefined;
  }
  
  this.parent = this.game =
    this.config = this.hardpoints = undefined;
};

module.exports = TargetingComputer;
