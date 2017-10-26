var engine = require('engine'),
    Basic = require('./Basic');

function Pirate(ship, home) {
  Basic.call(this, ship);

  this.type = 'pirate';

  this.settings = {
    disengage: 9216,
    friendly: ['pirate'],
    bounds: false,
    escape: {
      health: 0.2,
    },
    sensor: {
      aim: 0.5,
      range: 4096
    }
  };
};

Pirate.prototype = Object.create(Basic.prototype);
Pirate.prototype.constructor = Pirate;

Pirate.prototype.scanner = function() {
  var targets, scan, target, station,
      game = this.game,
      sensor = this.sensor,
      ships = this.game.ships,
      stations = this.game.stations,
      priority = {
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

    if(scan.disabled) { continue; }
    if(sensor.contains(p2.x, p2.y)) {
      if(!this.friendly(scan)) {
        priority.enemy[scan.data.health] = scan;
      } else {
        priority.friendly[scan.data.health] = scan;
      }
    }
  }

  // scan nearby stations
  for(var s in stations) {
    scan = stations[s];
    p2 = scan.movement.position;

    if(scan.disabled) { continue; }
    if(sensor.contains(p2.x, p2.y)) {
      station = scan;
    }
  }

  // find weakest
  targets = Object.keys(priority.enemy);
  targets.sort(ascending);
  targets.length && this.engage(station ? station : priority.enemy[targets[0]]);
};

module.exports = Pirate;
