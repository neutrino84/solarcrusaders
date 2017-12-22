
var engine = require('engine'),
    client = require('client');

function Basic(ship) {
  this.type = 'basic';

  this.ship = ship;
  this.game = ship.game;
  this.manager = ship.manager;

  this.timer = null;
  this.target = null;
  this.throttle = null;

  this.retreat = false;

  this.sensor = new engine.Circle();
  this.offset = new engine.Point();

  this.settings = client.AIConfiguration[this.type];

  this.friendlies = this.settings.friendly;

  // this.settings = {
  //   disengage: 7680,
  //   friendly: ['basic', 'user', 'scavenger'],
  //   position: {
  //     radius: 2048,
  //     x: 2048,
  //     y: 2048
  //   },
  //   bounds: 4096,
  //   escape: {
  //     health: 0.25,
  //   },
  //   sensor: {
  //     aim: 0.5,
  //     range: 2096
  //   }
  // };
};

Basic.prototype.constructor = Basic;

Basic.prototype.update = function() {
  if(!this.game){return}
  var ship = this.ship,
      sensor = this.sensor,
      offset = this.offset,
      settings = this.settings,
      rnd = this.game.rnd,
      p1, p2, size, health;

  p1 = ship.movement.position;
  sensor.setTo(p1.x, p1.y, settings.sensor.range);
  health = ship.data.health / ship.config.stats.health;

  // retreat due to damage
  if(health < settings.escape.health) {
    this.retreat = true;
  } else {
    this.retreat = false;
  }

  // check bounds
  if(settings.bounds && p1.distance(settings.position) > settings.bounds) {
    this.retreat = true;
  }

  // target ships
  if(this.target == null && rnd.frac() < 0.5) {
    this.scanner();
  }

  //plot course
  this.plot();
};

Basic.prototype.scanner = function() {
  var targets, scan, target,
      sensor = this.sensor,
      ships = this.manager.ships,
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

  // find weakest
  targets = Object.keys(priority.enemy);

  if(this.game.rnd.frac() > 0.5) {
    targets.sort(ascending)
  }

  targets.length && this.engage(priority.enemy[targets[0]]);
};

Basic.prototype.friendly = function(target) {
  var settings = this.settings;
  if(this.attackingStation){
    console.log('GOT HERE')
    return true;
  }
  if(target.ai && settings.friendly.indexOf(target.ai.type) >= 0) { return true; }
  if(target.user && settings.friendly.indexOf('user') >= 0) { return true; }
  return false;
};

Basic.prototype.engage = function(target) {
  var settings = this.settings,
      ship = this.ship,
      health = ship.data.health / ship.config.stats.health;

  // finish attack
  if(!this.target && !this.friendly(target)) {
    this.target = target;

    this.attacker && this.game.clock.events.remove(this.attacker);
    this.attacker = this.game.clock.events.loop(ship.data.rate, this.attack, this);

    this.disengager && this.game.clock.events.remove(this.disengager);
    this.disengager = this.game.clock.events.add(settings.disengage, this.disengage, this);
  }

  if(this.game.rnd.frac() < 0.5) {
    ship.activate('piercing');
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

Basic.prototype.disengage = function() {
  this.target = null;
  this.attacker && this.game.clock.events.remove(this.attacker);
};

Basic.prototype.attack = function() {
  var ship = this.ship,
      settings = this.settings,
      offset = this.offset,
      rnd = this.game.rnd,
      target, size,
      point = {};

  // attack sequence
  if(this.target && this.target.data) {
    target = this.target;

    size = target.data.size * settings.sensor.aim;
    offset.copyFrom(target.movement.position);
    offset.add(rnd.realInRange(-size, size), rnd.realInRange(-size, size));

    // attack
    ship.attack({
      uuid: ship.uuid,
      target: target.uuid,
      targ: {
        x: offset.x,
        y: offset.y
      }
    });
  }
};

// Basic.prototype.attack = function() {
//   var ship = this.ship,
//       settings = this.settings,
//       offset = this.offset,
//       rnd = this.game.rnd,
//       target, size,
//       point = {};
//   // attack sequence
//   if(this.target) {
//     target = this.target;

//   if(ship.chassis === 'scavengers-x03c'){
//     // console.log('overseer attacking ', target.data.chassis)
//   }
//   if(ship.chassis === 'scavengers-x04d'){
//     // console.log('queen attacking ', target.data.chassis)
//   }
//     size = target.data.size * settings.sensor.aim;
//     offset.copyFrom(target.movement.position);
//     offset.add(rnd.realInRange(-size, size), rnd.realInRange(-size, size));

//     // attack
//     ship.attack({
//       uuid: ship.uuid,
//       target: target.uuid,
//       targ: {
//         x: offset.x,
//         y: offset.y
//       }
//     });
//   }
// };

Basic.prototype.plot = function(){
  var rnd = this.game.rnd,
      ship = this.ship,
      settings = this.settings,
      offset = this.offset,
      p1 = ship.movement.position,
      p2, size;

  // plot destination
  if(!this.retreat && this.target && this.target.data) {
    size = this.target.data.size * 4;
    offset.copyFrom(this.target.movement.position);
    offset.add(rnd.realInRange(-size, size), rnd.realInRange(-size, size));
    ship.movement.plot({ x: this.offset.x-p1.x, y: this.offset.y-p1.y }, this.throttle);
  } else if(rnd.frac() > 0.75 || this.retreat) {
    p2 = this.getHomePosition();
    ship.movement.plot({ x: p2.x-p1.x, y: p2.y-p1.y });
  };
};

Basic.prototype.getHomePosition = function() {
  var position = this.settings.position,
      sensor = this.sensor;
      sensor.setTo(position.x, position.y, position.radius);
  return sensor.random();
};

Basic.prototype.destroy = function() {
  this.disengager && this.game.clock.events.remove(this.disengager);
  this.attacker && this.game.clock.events.remove(this.attacker);
  this.ship = this.game = this.manager = this.offset =
    this.timer = this.target = this.aim = undefined;
};

module.exports = Basic;
