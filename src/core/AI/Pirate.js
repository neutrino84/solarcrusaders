var engine = require('engine'),
    Basic = require('./Basic');

function Pirate(ship) {
  Basic.call(this, ship);

  this.type = 'pirate';

  this.aimRadius = 64;
  this.attackRate = 500;
  this.respawnTime = 3600000;
  this.disengageTime = 16000;
  this.defaultSpeedMagnitude = 192;
  this.sightRange = 2048;

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

      if(ships[s].disabled || ships[s].ai) { continue; }
      if(sight.contains(p2.x, p2.y)) {
        if(global.Math.random() > 0.5) {
          this.engage(ships[s]);
          break;
        }
      }
    }
  }
};

Pirate.prototype.getHomePosition = function() {
  return this.patrol.random();
};

module.exports = Pirate;
