
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
  var hardpoint, config,
      parent = this.parent,
      hardpoints = this.hardpoints,
      config = this.config.hardpoints;
  for(var t in config) {
    hardpoint = new Hardpoint(this, config[t]);
    hardpoint.fxGroup = parent.manager.fxGroup;
    hardpoint.flashEmitter = parent.manager.flashEmitter;
    hardpoint.explosionEmitter = parent.manager.explosionEmitter;
    hardpoint.glowEmitter = parent.manager.glowEmitter;
    hardpoints.push(hardpoint);
    parent.addChild(hardpoint.sprite);
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

  this.parent = this.game = this.enhancements =
    this.config = undefined;

  for(var t in this.hardpoints) {
    hardpoint = this.hardpoints[t];
    hardpoint.fxGroup = hardpoint.flashEmitter =
      hardpoint.explosionEmitter =
      hardpoint.glowEmitter = undefined;
    hardpoint.destroy();
  }

  this.hardpoints = [];
};

module.exports = TargetingComputer;
