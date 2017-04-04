var engine = require('engine'),
    Basic = require('./Basic');

function Scavenger(ship, home) {
  Basic.call(this, ship);

  this.type = 'scavenger';
  this.harvestTime = 16000;
  this.target = ship.target;

    this.settings = {
    aim: 1.25,
    respawn: 60000,
    disengage: 9216,
    friendly: ['scavenger','pirate','basic'],
    position: {
      radius: 112,
      x: ship.movement.position.x,
      y: ship.movement.position.y
    },
    escape: {
      health: 0.2,
    },
    sensor: {
      range: 4096
    }
  }
};

Scavenger.prototype = Object.create(Basic.prototype);
Scavenger.prototype.constructor = Scavenger;

Scavenger.prototype.harvest = function(target) {
  console.log('got to harvest. target is ', target)
  // var aim = this.aim,
  //     position;
  // if(target && target.movement) {
  //   aim.setTo(position.x, position.y, 256); // 256 is the radius of flying around
  //   aim.random(false, aim);
  // }

 
  // this.enabled = this.enabled ? false : true;
};

// Scavenger.prototype.engage = function(target) {
//   var settings = this.settings,
//       ship = this.ship;

  // finish attack
  // if(this.target == null && !this.friendly(target)) {
  //   this.target = target;

  //   this.attacker && this.game.clock.events.remove(this.attacker);
  //   this.attacker = this.game.clock.events.loop(ship.data.rate, this.attack, this);

  //   this.disengager && this.game.clock.events.remove(this.disengager);
  //   this.disengager = this.game.clock.events.add(settings.disengage, this.disengage, this);

  //   if(this.game.rnd.frac() > 0.75) {
  //     ship.activate('peircing');
  //   }
  // }

  // engage countermeasures
//   if(ship.data.health < 0.5) {
//     ship.activate('shield');
//   }
//   if(ship.data.health < 0.25) {
//     ship.activate('heal');
//   }
//   if(this.game.rnd.frac() > 0.8) {
//     ship.activate('booster');
//   }
// };

Scavenger.prototype.getHomePosition = function() {
  var position = this.settings.position,
      sensor = this.sensor;
      sensor.setTo(position.x, position.y, position.radius);
  return this.sensor.random();
};

Scavenger.prototype.update = function() {
  var ship = this.ship,
      ships = this.manager.ships,
      sensor = this.sensor,
      settings = this.settings,
      target = this.target,
      magnitude, distance;

  p1 = this.ship.movement.position;

  // plot destination
  if(target && target.disabled) {
    p2 = this.sensor.setTo(target.movement.position.x, target.movement.position.y, target.data.size*2);
    p2 = p2.circumferencePoint(global.Math.random() * global.Math.PI);
    distance = p1.distance(p2);
    magnitude = distance/4;
  } else {
    p2 = this.sensor.setTo(this.settings.position.x, this.settings.position.y, this.settings.position.radius).random(false);
  }

  // head to destination
  ship.movement.plot({ x: p2.x-p1.x, y: p2.y-p1.y }, magnitude);
};

module.exports = Scavenger;
//   this.offset = new engine.Point();
//   this.patrol = new engine.Circle(0, 0, 512);

//   this.game.clock.events.loop(global.Math.random * 500 + 500, this.harvest, this);
// };



// S
// };


// Scavenger.prototype.getHomePosition = function() {
//   return this.patrol.random();
// };

