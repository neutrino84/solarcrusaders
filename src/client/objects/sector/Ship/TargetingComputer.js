
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
  var hardpoint, config, data, index,
      parent = this.parent,
      hardpoints = parent.details.hardpoints;
  for(var h in hardpoints) {
    index = hardpoints[h].index;
    hardpoint = new Hardpoint(this, hardpoints[h], this.config.hardpoints[index]);
    hardpoint.fxGroup = parent.manager.fxGroup;
    hardpoint.flashEmitter = parent.manager.flashEmitter;
    hardpoint.explosionEmitter = parent.manager.explosionEmitter;
    hardpoint.glowEmitter = parent.manager.glowEmitter;
    hardpoint.fireEmitter = parent.manager.fireEmitter;
    this.hardpoints.push(hardpoint);
  }
};

TargetingComputer.prototype.fire = function(miss) {
  var parent = this.parent,
      target = parent.target,
      hardpoints = this.hardpoints;
  if(target && hardpoints.length > 0) {
    for(var t in hardpoints) {
      hardpoints[t].fire(t, miss);
    }
  }
};

TargetingComputer.prototype.cancel = function(miss) {
  var game = this.game,
      parent = this.parent,
      target = parent.target,
      hardpoints = this.hardpoints,
      hardpoint;
  if(target && hardpoints.length > 0) {
    for(var t in hardpoints) {
      hardpoint = hardpoints[t];
      hardpoint.timer && game.clock.events.remove(
        hardpoint.timer
      );
    }
  }
};

TargetingComputer.prototype.update = function() {
  var parent = this.parent,
      target = parent.target,
      hardpoints = this.hardpoints;
  if(target && hardpoints.length > 0) {
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
