
var engine = require('engine');

function Basic(ship) {
  this.ship = ship;
  this.game = ship.game;
  this.manager = ship.manager;

  this.timer = null;
  this.countdown = null;
  this.target = null;
  this.aim = new engine.Circle();

  this.aimRadius = 192;
  this.attackRate = 500;
  this.respawnTime = 10000;
  this.disengageTime = 8000;
  this.defaultSpeedMagnitude = 128;

  this.type = 'basic';
};

Basic.prototype.constructor = Basic;

Basic.prototype.update = function() {
  var ship = this.ship,
      target = this.target,
      movement = ship.movement,
      position = movement.position,
      destination;
  if(target && global.Math.random() > 0.25) {
    destination = target.movement.position;
    ship.movement.plot({ x: destination.x-position.x, y: destination.y-position.y });
  } else if(global.Math.random() > 0.75) {
    destination = this.getHomePosition();
    ship.movement.plot({ x: destination.x-position.x, y: destination.y-position.y }, this.defaultSpeedMagnitude);
  }
};

Basic.prototype.engage = function(target) {
  if((target.ai && target.ai.type !== 'pirate') || target.user) { return; }
  if(this.target != target) {
    this.target = target;

    this.timer && this.game.clock.events.remove(this.timer);
    this.timer = this.game.clock.events.loop(this.attackRate, this.attack, this);

    this.countdown && this.game.clock.events.remove(this.countdown);
    this.countdown = this.game.clock.events.loop(this.disengageTime, this.disengage, this);
  }
};

Basic.prototype.disengage = function() {
  this.target = null;
  this.timer && this.game.clock.events.remove(this.timer);
};

Basic.prototype.attack = function() {
  var aim = this.aim,
      ship = this.ship,
      position = this.target.movement.position,
      point = {};
  
  // aim
  aim.setTo(position.x, position.y, this.aimRadius);
  aim.random(false, point);

  // attack
  ship.attack({
    uuid: ship.uuid,
    targ: point
  });
};

Basic.prototype.getHomePosition = function() {
  return this.manager.generateRandomPosition(2048);
};

Basic.prototype.destroy = function() {
  this.timer && this.game.clock.events.remove(this.timer);
  this.countdown && this.game.clock.events.remove(this.countdown);
  this.ship = this.game = this.manager =
    this.timer = this.target = this.aim = undefined;
};

module.exports = Basic;
