
var engine = require('engine'),
    Turret = require('../Turret');

function TargetingComputer(parent, config) {
  this.parent = parent;
  this.game = parent.game;
  this.config = config;

  this.enhancements = {}
  this.turrets = [];
};

TargetingComputer.prototype.constructor = TargetingComputer;

TargetingComputer.prototype.enadd = function(enhancement) {
  this.enhancements[enhancement] = true;
};

TargetingComputer.prototype.enremove = function(enhancement) {
  delete this.enhancements[enhancement];
};

TargetingComputer.prototype.create = function() {
  var turret, config,
      parent = this.parent,
      turrets = this.turrets,
      config = this.config.turrets;
  for(var t in config) {
    turret = new Turret(this, config[t]);
    turret.fxGroup = parent.manager.fxGroup;
    turret.flashEmitter = parent.manager.flashEmitter;
    turret.explosionEmitter = parent.manager.explosionEmitter;
    turret.glowEmitter = parent.manager.glowEmitter;
    turrets.push(turret);
    parent.addChild(turret.sprite);
  }
};

TargetingComputer.prototype.fire = function(miss) {
  var parent = this.parent,
      target = parent.target,
      turrets = this.turrets;
  if(target && turrets.length > 0) {
    for(var t in turrets) {
      turrets[t].fire(t, miss);
    }
  }
};

TargetingComputer.prototype.update = function() {
  var parent = this.parent,
      target = parent.target,
      turrets = this.turrets;
  if(target && turrets.length > 0) {
    for(var t in turrets) {
      turrets[t].update();
    }
  }
};

TargetingComputer.prototype.destroy = function() {
  var turret;

  this.parent = this.game = this.enhancements =
    this.config = undefined;

  for(var t in this.turrets) {
    turret = this.turrets[t];
    turret.fxGroup = turret.flashEmitter =
      turret.explosionEmitter =
      turret.glowEmitter = undefined;
    turret.destroy();
  }

  this.turrets = [];
};

module.exports = TargetingComputer;
