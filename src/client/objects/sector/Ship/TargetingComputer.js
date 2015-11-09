
var engine = require('engine'),
    Turret = require('../Turret');

function TargetingComputer(parent, config) {
  this.parent = parent;
  this.game = parent.game;
  this.config = config;

  this.on = true;
  this.targetingMode = TargetingComputer.RANDOM;

  this.turrets = [];
  this.fxGroup = parent.manager.fxGroup;
};

TargetingComputer.RANDOM = 0;
TargetingComputer.ROOM = 1;
TargetingComputer.WEAKNESSES = 2;

TargetingComputer.prototype.constructor = TargetingComputer;

TargetingComputer.prototype.create = function() {
  var turret, config,
      parent = this.parent,
      turrets = this.turrets,
      config = this.config.turrets;
  for(var t in config) {
    turret = new Turret(this, config[t]);
    turrets.push(turret);
    
    parent.addChild(turret.sprite);
  }
};

TargetingComputer.prototype.update = function() {
  var parent = this.parent,
      target = parent.target,
      turrets = this.turrets;
  if(target && turrets.length > 0) {
    if(target.disabled) {
      parent.target = null;
      return;
    }
    for(var t in turrets) {
      turrets[t].update();
    }
  }
};

module.exports = TargetingComputer;
