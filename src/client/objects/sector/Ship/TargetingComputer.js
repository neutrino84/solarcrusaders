
var engine = require('engine'),
    Hardpoint = require('../Hardpoint');

function TargetingComputer(parent, config) {
  this.parent = parent;
  this.game = parent.game;
  this.config = config;

  this.enhancements = {}
  this.hardpoints = [];
};

TargetingComputer.prototype.constructor = TargetingComputer;

TargetingComputer.prototype.enadd = function(enhancement) {
  this.enhancements[enhancement] = true;
};

TargetingComputer.prototype.enremove = function(enhancement) {
  delete this.enhancements[enhancement];
};

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

TargetingComputer.prototype.fire = function() {
  var parent = this.parent,
      target = parent.target,
      hardpoints = this.hardpoints;
  if(target && hardpoints.length > 0) {
    for(var t in hardpoints) {
      hardpoints[t].fire(t, target);
    }
  }
};

TargetingComputer.prototype.cancel = function() {
  var game = this.game,
      parent = this.parent,
      target = parent.target,
      hardpoints = this.hardpoints,
      hardpoint;
  if(target && hardpoints.length > 0) {
    for(var t in hardpoints) {
      hardpoint = hardpoints[t];
      hardpoint.timer && game.clock.events.remove(hardpoint.timer);
      hardpoint.target = null;
    }
  }
};

TargetingComputer.prototype.update = function() {
  var parent = this.parent,
      hardpoints = this.hardpoints;
  if(hardpoints.length > 0) {
    for(var t in hardpoints) {
      hardpoints[t].update();
    }
  }
};

TargetingComputer.prototype.destroy = function() {
  var hardpoint;
  
  for(var t in this.hardpoints) {
    hardpoint = this.hardpoints[t];
    hardpoint.fxGroup =
      hardpoint.flashEmitter =
      hardpoint.explosionEmitter =
      hardpoint.glowEmitter = undefined;
    hardpoint.destroy();
  }
  
  this.hardpoints = [];

  this.parent = this.game = this.enhancements =
    this.config = undefined;
};

module.exports = TargetingComputer;
