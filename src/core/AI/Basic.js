
var engine = require('engine');

function Basic(ship) {
  this.ship = ship;
  this.game = ship.game;
  this.manager = ship.manager;

  this.timer = null;
  this.countdown = null;
  this.target = null;
  this.aim = new engine.Circle();
  
  this.type = 'basic';
};

Basic.prototype.constructor = Basic;

Basic.prototype.update = function() {
  var manager = this.manager,
      ship = this.ship,
      target = this.target,
      movement = ship.movement,
      position = movement.position,
      destination;
  
  if(target && global.Math.random() > 0.5) {
    destination = target.movement.position;
    ship.movement.plot({ x: destination.x-position.x, y: destination.y-position.y });
  } else if(global.Math.random() > 0.5) {
    destination = manager.generateRandomPosition(1024);
    ship.movement.plot({ x: destination.x-position.x, y: destination.y-position.y });
  }
};

Basic.prototype.engage = function(target) {
  if(target.ai) return;
  if(this.target != target) {
    this.target = target;

    this.timer && this.game.clock.events.remove(this.timer);
    this.timer = this.game.clock.events.loop(500, this.attack, this);

    this.countdown && this.game.clock.events.remove(this.countdown);
    this.countdown = this.game.clock.events.loop(5000, this.disengage, this);
  }
};

Basic.prototype.disengage = function() {
  this.target = null;
  this.timer && this.game.clock.events.remove(this.timer);
};

Basic.prototype.attack = function() {
  var ship = this.ship,
      target = this.target.movement,
      aim = this.aim,
      point = {};
  
  // aim
  aim.setTo(target.position.x, target.position.y, 128);
  aim.random(false, point);

  // attack
  ship.attack({
    uuid: ship.uuid,
    targ: point
  });
};

Basic.prototype.destroy = function() {
  this.timer && this.game.clock.events.remove(this.timer);
  this.countdown && this.game.clock.events.remove(this.countdown);
  this.ship = this.game = this.manager =
    this.timer = this.target = this.aim = undefined;
};

module.exports = Basic;
