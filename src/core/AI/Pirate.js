var engine = require('engine'),
    Basic = require('./Basic');

function Pirate(ship) {
  Basic.call(this, ship);

  this.type = 'pirate';

  this.aimRadius = 128;
  this.attackRate = 500;
  this.respawnTime = 60000;
  this.disengageTime = 16000;
  this.defaultSpeedMagnitude = 320;
  this.sightRange = 1024;

  this.sight = new engine.Circle();
  this.patrol = new engine.Circle(ship.movement.position.x, ship.movement.position.y, 128);

  this.game.clock.events.loop(500, this.scan, this);
};

Pirate.prototype = Object.create(Basic.prototype);
Pirate.prototype.constructor = Pirate;

Pirate.prototype.scan = function() {
  var ships = this.manager.ships,
      ship = this.ship,
      sight = this.sight,
      p1, p2;
  if(ship.disabled) { return; }
  if(global.Math.random() > 0.5) {
    p1 = ship.movement.position;
    sight.setTo(p1.x, p1.y, this.sightRange);

    for(var s in ships) {
      p2 = ships[s].movement.position;

      if(ships[s].disabled || (ships[s].ai && ships[s].ai.type === 'pirate')) { continue; }
      if(sight.contains(p2.x, p2.y)) {
        if(global.Math.random() > 0.25) {
          this.engage(ships[s]);
          break;
        }
      }
    }
  }
};

Pirate.prototype.engage = function(target) {
  if(target.ai && target.ai.type === 'pirate') { return; }
  if(this.target != target) {
    this.target = target;

    this.timer && this.game.clock.events.remove(this.timer);
    this.timer = this.game.clock.events.loop(this.attackRate, this.attack, this);

    this.countdown && this.game.clock.events.remove(this.countdown);
    this.countdown = this.game.clock.events.loop(this.disengageTime, this.disengage, this);
  }
};

Pirate.prototype.update = function() {
  var ship = this.ship,
      target = this.target,
      movement = ship.movement,
      position = movement.position,
      destination;
  if(target) {
    destination = target.movement.position;
    ship.movement.plot({ x: destination.x-position.x, y: destination.y-position.y });
  } else {
    destination = this.getHomePosition();
    ship.movement.plot({ x: destination.x-position.x, y: destination.y-position.y }, this.defaultSpeedMagnitude);
  }
};

Pirate.prototype.getHomePosition = function() {
  return this.patrol.random();
};

module.exports = Pirate;
