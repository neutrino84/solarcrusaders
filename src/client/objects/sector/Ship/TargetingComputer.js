
var engine = require('engine'),
    Hardpoint = require('../Hardpoint');

function TargetingComputer(ship, config) {
  this.ship = ship;
  this.game = ship.game;
  this.manager = ship.manager,
  this.config = config;

  this.hardpoints = [];
  this.enhancements = {};

  this.target = new engine.Point();

  // throttle firing rate
  this.fire = this.game.clock.throttle(this.fired, this.ship.data.rate, this, true);
};

TargetingComputer.prototype.constructor = TargetingComputer;

TargetingComputer.prototype.create = function() {
  var hardpoint, config, slot,
      ship = this.ship,
      hardpoints = this.hardpoints,
      config = this.config.hardpoints,
      data = ship.data.hardpoints,
      length = config.length;
  for(var i=0; i<length; i++) {
    hardpoint = new Hardpoint(this, config[i], data[i], i, length);
    hardpoints.push(hardpoint);
  }
};

TargetingComputer.prototype.attack = function(data) {
  var hardpoints = this.hardpoints,
      length = hardpoints.length,
      target = data.targ;
  if(length > 0) {
    // update target
    this.target.set(target.x, target.y);
    this.targetShip = this.manager.ships[data.target];

    // display
    for(var i=0; i<length; i++) {
      hardpoint = hardpoints[i];
      hardpoint.fire(this.target);
    }
  }
};

TargetingComputer.prototype.hit = function(ship, data) {
  var hardpoints = this.hardpoints,
      hardpoint = hardpoints[data.hardpoint.slot];
  if(ship && hardpoint) {
    console.log('hardpoint')
    hardpoint.hit(ship, data.hardpoint.target);
  }
};

TargetingComputer.prototype.fired = function() {
  var game = this.game,
      ship = this.ship,
      hardpoints = this.hardpoints,
      input = this.game.input,
      socket = ship.manager.socket,
      hardpoint, distance,
      target = {
        x: input.mousePointer.x,
        y: input.mousePointer.y
      };
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
  var ship = this.ship,
      hardpoints = this.hardpoints,
      length = hardpoints.length;
  if(length > 0) {
    ship.updateTransform();
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
