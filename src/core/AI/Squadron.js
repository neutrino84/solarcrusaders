var engine = require('engine'),
    Basic = require('./Basic');

function Squadron(ship, home) {
  Basic.call(this, ship);

  this.type = 'squadron';
  this.master = ship.master;

  this.settings = {
    respawn: 600000,
    disengage: 9216,
    friendly: ['user','basic','squadron'],
    position: {
      radius: 512,
      x: ship.movement.position.x,
      y: ship.movement.position.y
    },
    escape: {
      health: 0.01,
    },
    sensor: {
      aim: 1.25,
      range: 4096
    }
  };
};

Squadron.prototype = Object.create(Basic.prototype);

Squadron.prototype.constructor = Squadron;

// Squadron.prototype.scanner = function() {
//   //.. scan for user/target
//   var target, targets, scan, distance,
//       sensor = this.sensor,
//       settings = this.settings,
//       ships = this.manager.ships,
//       ship = this.ship,
//       player = 
//       priority = {
//         harvest: {},
//         enemy: {},
//         friendly: {}
//       },
//       ascending = function(a, b) {
//         return a-b;
//       };

//   if(this.target == null) {
//     // scan nearby ships
//     for(var s in ships) {
//       scan = ships[s];
//       p2 = scan.movement.position;

//       if(scan.disabled && sensor.contains(p2.x, p2.y)) {
//         distance = p2.distance(ship.movement.position);
//         priority.harvest[distance] = scan;

//         this.ship.movement.throttle = distance/2;
//       }
//     }
//     // if(target.durability < 1){this.disengage()}

//     // find harvestable
//     targets = Object.keys(priority.harvest);
//     // targets.length && this.engage();
//     this.target = priority.harvest[targets.sort(ascending)[0]];
//     this.attacker && this.game.clock.events.remove(this.attacker);
//     this.attacker = this.game.clock.events.loop(ship.data.rate, this.attack, this);

//     this.disengager && this.game.clock.events.remove(this.disengager);
//     this.disengager = this.game.clock.events.add(settings.disengage, this.disengage, this);
//   }

// };

Squadron.prototype.getHomePosition = function() {
  var position = this.settings.position,
      sensor = this.sensor;
      sensor.setTo(position.x, position.y, position.radius);
  return this.sensor.random();
};

module.exports = Squadron;
