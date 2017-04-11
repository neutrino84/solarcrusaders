var engine = require('engine'),
    Basic = require('./Basic');

function Scavenger(ship, home) {
  Basic.call(this, ship);

  this.type = 'scavenger';

  this.settings = {
    respawn: 60000,
    disengage: 9216,
    friendly: ['scavenger'],
    position: {
      radius: 128,
      x: ship.movement.position.x,
      y: ship.movement.position.y
    },
    escape: {
      health: 0.2,
    },
    sensor: {
      aim: 1.0,
      range: 16384
    }
  }
};

Scavenger.prototype = Object.create(Basic.prototype);
Scavenger.prototype.constructor = Scavenger;

Scavenger.prototype.scanner = function() {
  //.. dead ships
  var targets, scan,
      sensor = this.sensor,
      ships = this.manager.ships,
      priority = {
        harvest: {},
        enemy: {},
        friendly: {}
      };

  // scan nearby ships
  for(var s in ships) {
    scan = ships[s];
    p2 = scan.movement.position;

    if(scan.disabled && sensor.contains(p2.x, p2.y)) {
      priority.harvest[scan.data.health] = scan;
    }
  }

  // find weakest
  targets = Object.keys(priority.harvest);
  targets.length && this.engage(priority.harvest[targets.sort()[0]]);
};

Scavenger.prototype.engage = function(target) {
  var ship = this.ship,
      health = ship.data.health / ship.config.stats.health;

  // engage countermeasures
  if(this.game.rnd.frac() < 0.10) {
    ship.activate('booster');

    if(health < 0.5) {
      ship.activate('shield');
    }
    if(health < 0.5) {
      ship.activate('heal');
    }
  }
};

Scavenger.prototype.disengage = function() {
  if(this.target && !this.target.disabled) {
    this.target = null;
    this.attacker && this.game.clock.events.remove(this.attacker);
  }
};

Scavenger.prototype.getHomePosition = function() {
  var position = this.settings.position,
      sensor = this.sensor;
      sensor.setTo(position.x, position.y, position.radius);
  return this.sensor.random();
};

module.exports = Scavenger;
