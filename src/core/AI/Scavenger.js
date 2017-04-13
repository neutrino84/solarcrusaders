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
      health: 0.5,
    },
    sensor: {
      aim: 0.8,
      range: 16384
    }
  }
};

Scavenger.prototype = Object.create(Basic.prototype);
Scavenger.prototype.constructor = Scavenger;

Scavenger.prototype.scanner = function() {
  //.. dead ships
  var target, targets, scan, distance,
      sensor = this.sensor,
      ships = this.manager.ships,
      ship = this.ship,
      priority = {
        harvest: {},
        enemy: {},
        friendly: {}
      },
      ascending = function(a, b) {
        return a-b;
      };

  // scan nearby ships
  for(var s in ships) {
    scan = ships[s];
    p2 = scan.movement.position;

    if(scan.disabled && sensor.contains(p2.x, p2.y)) {
      distance = p2.distance(ship.movement.position);
      priority.harvest[distance] = scan;

      this.throttle = distance/2;
    }
  }

  // find harvestable
  targets = Object.keys(priority.harvest);
  targets.length && this.engage(priority.harvest[targets.sort(ascending)[0]]);
};

Scavenger.prototype.engage = function(target) {
  var settings = this.settings,
      ship = this.ship,
      health = ship.data.health / ship.config.stats.health;

  // finish attack
  if(this.target == null && target.disabled) {
    this.target = target;
    this.attacker && this.game.clock.events.remove(this.attacker);
    this.attacker = this.game.clock.events.loop(ship.data.rate, this.attack, this);

    this.disengager && this.game.clock.events.remove(this.disengager);
    this.disengager = this.game.clock.events.add(settings.disengage, this.disengage, this);
    if(target.durability < 1){this.disengage()}
  }

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
  if(this.target && !this.target.disabled || this.target && this.target.durability < 1) {
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
