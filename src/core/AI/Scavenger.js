var engine = require('engine'),
    Basic = require('./Basic');

function Scavenger(ship, home) {
  Basic.call(this, ship);

  console.log(ship.ship)
  this.type = 'scavenger';
  this.harvestTime = 16000;

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
  var aim = this.aim,
      // target = this.target,
      position;
  if(target && target.movement) {
    aim.setTo(position.x, position.y, 256); // 256 is the radius of flying around
    aim.random(false, aim);
  }

 
  this.enabled = this.enabled ? false : true;
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

module.exports = Scavenger;
//   this.offset = new engine.Point();
//   this.patrol = new engine.Circle(0, 0, 512);

//   this.game.clock.events.loop(global.Math.random * 500 + 500, this.harvest, this);
// };


// Scavenger.prototype.update = function() {

//   var ship = this.ship,
//       target = this.target,
//       offset = this.offset,
//       patrol = this.patrol,
//       distance;


//   if(target && target.movement) {
//     // console.log('in update function, target is: ',target)
//     patrol.setTo(target.movement.position.x, target.movement.position.y, 96);
//     patrol.random(false, offset);

//     distance = global.Math.max(engine.Point.distance(target.movement.position, ship.movement.position)/2, 68);

//     ship.movement.plot({ x: offset.x-ship.movement.position.x, y: offset.y-ship.movement.position.y }, distance);
//   }
// };

// S
// };


// Scavenger.prototype.getHomePosition = function() {
//   return this.patrol.random();
// };

