
var engine = require('engine'),
    Hardpoint = require('../Hardpoint');

function TargetingComputer(ship, config) {
  this.ship = ship;
  this.game = ship.game;
  this.manager = ship.manager,
  this.config = config;

  this.hardpoints = [];
  this.target = new engine.Point();
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
      target = this.target;
  if(hardpoints.length > 0) {
    // update target
    target.set(data.targ.x, data.targ.y);

    // display
    for(var i=0; i<hardpoints.length; i++) {
      hardpoint = hardpoints[i];
      hardpoint.fire(target);
    }
  }
};

TargetingComputer.prototype.hit = function(ship, data) {
  var hardpoints = this.hardpoints,
      hardpoint = hardpoints[data.hardpoint.slot];
  
  // notify hardpoint
  if(ship && hardpoint) {
    hardpoint.hit(ship, data.hardpoint.target);
  }
};

TargetingComputer.prototype.fired = function() {
  var game = this.game,
      ship = this.ship,
      hardpoints = this.hardpoints,
      target = this.target,
      input = this.game.input,
      socket = ship.manager.socket,
      hardpoint;

  // player fired
  if(hardpoints.length > 0) {
    game.world.worldTransform.applyInverse(input.mousePointer, target);
    
    // display
    for(var i=0; i<hardpoints.length; i++) {
      hardpoint = hardpoints[i];
      hardpoint.fire(target);
    }

    // emit socket message
    socket.emit('ship/attack', {
      uuid: ship.uuid,
      targ: {
        x: target.x,
        y: target.y
      }
    });
  }
};

TargetingComputer.prototype.update = function() {
  var ship = this.ship,
      hardpoints = this.hardpoints,
      length = hardpoints.length;
  if(length > 0) {
    // reposition ship
    ship.updateTransform();
    
    // update hardpoints
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
  }
  
  this.ship = this.game =
    this.config = this.hardpoints = undefined;
};

module.exports = TargetingComputer;
