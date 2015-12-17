
var engine = require('engine'),
    Turret = require('../Turret');

function TargetingComputer(parent, config) {
  this.parent = parent;
  this.game = parent.game;
  this.config = config;

  this.turrets = [];
};

TargetingComputer.prototype.constructor = TargetingComputer;

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

TargetingComputer.prototype.fire = function() {
  var parent = this.parent,
      target = parent.target,
      turrets = this.turrets;
  if(target && turrets.length > 0 && parent.renderable) {
    for(var t in turrets) {
      turrets[t].fire();
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

module.exports = TargetingComputer;
