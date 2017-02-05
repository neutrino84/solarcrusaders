
var engine = require('engine'),
    Hardpoint = require('../Hardpoint');

function TargetingComputer(ship, config) {
  this.ship = ship;
  this.game = ship.game;
  this.manager = ship.manager,
  this.stats = ship.config.stats;
  this.config = config;

  this.hardpoints = [];
  this.enhancements = {};

  this.target = new engine.Point();

  this.fire = this.game.clock.throttle(this.fired, this.stats.rate, this, true);
};

TargetingComputer.prototype.constructor = TargetingComputer;

TargetingComputer.prototype.create = function() {
  var hardpoint, config, data, slot,
      ship = this.ship,
      hardpoints = ship.details.hardpoints;
  for(var h in hardpoints) {
    slot = hardpoints[h].slot;

    hardpoint = new Hardpoint(this, hardpoints[h], this.config.hardpoints[slot]);
    hardpoint.subGroup = ship.manager.subGroup;
    hardpoint.fxGroup = ship.manager.fxGroup;
    hardpoint.flashEmitter = ship.manager.flashEmitter;
    hardpoint.explosionEmitter = ship.manager.explosionEmitter;
    hardpoint.glowEmitter = ship.manager.glowEmitter;
    hardpoint.fireEmitter = ship.manager.fireEmitter;
    hardpoint.shockwaveEmitter = ship.manager.shockwaveEmitter;

    this.hardpoints[slot] = hardpoint;
  }
};

TargetingComputer.prototype.attack = function(data) {
  var hardpoints = this.hardpoints,
      length = hardpoints.length,
      target = data.targ;
  if(length > 0) {
    // update target
    this.target.set(target.x, target.y);

    // display
    for(var i=0; i<length; i++) {
      hardpoints[i].fire(target);
    }
  }
};

TargetingComputer.prototype.hit = function(hardpoint) {
  var ship = this.manager.ships[hardpoint.target],
      hardpoint = this.hardpoints[hardpoint.slot];
      ship && hardpoint.hit(ship);
};

TargetingComputer.prototype.fired = function(target) {
  var game = this.game,
      ship = this.ship,
      hardpoints = this.hardpoints,
      socket = ship.manager.socket,
      hardpoint,
      distance;
  if(hardpoints.length > 0) {
    game.world.worldTransform.applyInverse(target, this.target);

    // display
    for(var i=0; i<hardpoints.length; i++) {
      hardpoint = hardpoints[i];
      hardpoint.fire(this.target);
    }

    // server
    socket.emit('ship/attack', {
      uuid: ship.uuid,
      targ: {
        x: this.target.x,
        y: this.target.y
      }
    });
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
