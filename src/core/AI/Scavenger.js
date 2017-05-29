var engine = require('engine'),
    Basic = require('./Basic'),
    client = require('client');
    // Generator = require('../utils/Generator');

function Scavenger(ship, home) {
  Basic.call(this, ship);

  this.type = 'scavenger';

  this.settings = client.AIConfiguration[this.type];

  this.friendlies = this.settings.friendly;

  // this.settings = {
  //   respawn: 20000,
  //   disengage: 9216,
  //   friendly: ['scavenger', 'squadron'],
  //   position: {
  //     radius: 128,
  //     x: ship.movement.position.x,
  //     y: ship.movement.position.y
  //   },
  //   escape: {
  //     health: 0.5
  //   },
  //   sensor: {
  //     aim: 0.8,
  //     range: 56384
  //   }
  // }
  if(ship.chassis === 'scavengers-x04d' || ship.chassis === 'scavengers-x03c'){
    this.settings = client.AIConfiguration['scavenger-hostile'];
  }

    // this.generateShips();
};

Scavenger.prototype = Object.create(Basic.prototype);
Scavenger.prototype.constructor = Scavenger;

Scavenger.prototype.scanner = function() {
  //.. dead ships
  var target, targets, scan, distance,
      sensor = this.sensor,
      settings = this.settings,
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
  if(ship.chassis === 'scavengers-x01d' || ship.chassis === 'scavengers-x02c'){
    if(this.target == null) {
      // scan nearby ships
      for(var s in ships) {
        scan = ships[s];
        p2 = scan.movement.position;

        if(scan.disabled && sensor.contains(p2.x, p2.y)) {
          distance = p2.distance(ship.movement.position);
          priority.harvest[distance] = scan;

          this.ship.movement.throttle = distance/2;
        }
      }
      // find harvestable
      targets = Object.keys(priority.harvest);
      // targets.length && this.engage();
      this.target = priority.harvest[targets.sort(ascending)[0]];
      this.attacker && this.game.clock.events.remove(this.attacker);
      this.attacker = this.game.clock.events.loop(ship.data.rate, this.attack, this);

      this.disengager && this.game.clock.events.remove(this.disengager);
      this.disengager = this.game.clock.events.add(settings.disengage, this.disengage, this);
    }
  };
  if(ship.chassis === 'scavengers-x03c' || ship.chassis === 'scavengers-x04d'){
    // Basic.prototype.scanner.call(this);
    if(this.target == null) {
      // scan nearby ships
      for(var s in ships) {
        scan = ships[s];
        p2 = scan.movement.position;
        // if(scan.chassis === 'ubaidian-x01d'){console.log(scan)}
        if(scan.disabled) { continue; }
        if(sensor.contains(p2.x, p2.y)) {
          distance = p2.distance(ship.movement.position);
          if(!this.friendly(scan)) {
            priority.enemy[distance] = scan;
          } else {
            priority.friendly[distance] = scan;
          }
        }
      }

      // find enemies
      targets = Object.keys(priority.enemy);
      targets.length && this.engage(priority.enemy[targets.sort(ascending)[0]]);

      // targets.length && this.engage();
      this.target = priority.enemy[targets.sort(ascending)[0]];
      this.attacker && this.game.clock.events.remove(this.attacker);
      this.attacker = this.game.clock.events.loop(ship.data.rate, this.attack, this);

      this.disengager && this.game.clock.events.remove(this.disengager);
      this.disengager = this.game.clock.events.add(settings.disengage, this.disengage, this);
    }
  };
};

Scavenger.prototype.generateShips = function() {
  var iterator = {
        'scavengers-x01d': 2,
        'scavengers-x02c': 2,
        'scavengers-x03c': 0,
        'scavengers-x04d': 0
      };
  for(var chassis in iterator) {
    for(var i=0; i<iterator[chassis]; i++) {
      this.generateShip(chassis);
    }
  }
};

Scavenger.prototype.generateShip = function(chassis) {
  // var name = Generator.getName('hederaa').toUpperCase(),
  var throttle = global.Math.random() * 0.5 + 0.5;

  this.manager.create({
    name: 'steve',
    chassis: chassis,
    throttle: throttle,
    ai: 'scavenger',
    credits: global.Math.floor(global.Math.random() * 250 + 50),
    reputation: global.Math.floor(100 * (1 + global.Math.random())),
    x: -8192,
    y: 8192 
  });
};

Scavenger.prototype.engage = function(target) {
  var settings = this.settings,
      ship = this.ship,
      health = ship.data.health / ship.config.stats.health;

  // finish attack

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

Scavenger.prototype.attack = function(){
    if(!this.target){return}
    if(this.target.data.chassis === 'scavengers-x02c' || this.target.data.chassis === 'scavengers-x01d' || this.target.data.chassis === 'scavengers-x03c' || this.target.data.chassis === 'scavengers-x04d'){this.target = null; return}
    if(this.ship.chassis === 'scavengers-x03c' || this.ship.chassis === 'scavengers-x04d'){
      if(this.target && !this.target.disabled){
      Basic.prototype.attack.call(this)
      } else if(this.target && this.target.disabled) {
        this.disengage();
      }
    } else if(this.target && this.target.disabled && this.target.durability > 0 ){
    Basic.prototype.attack.call(this)
    } else if(this.target && !this.target.disabled) {
      this.disengage();
    };

  
};

Scavenger.prototype.plot = function(){
  // plot destination
  var rnd = this.game.rnd,
      ship = this.ship,
      sensor = this.sensor,
      p1 = ship.movement.position,
      settings = this.settings,
      offset = this.offset,
      size, distance;

  sensor.setTo(p1.x, p1.y, settings.sensor.range);    

  if(!this.retreat && this.target && this.target.durability > 0) {
    size = this.target.data.size * 4;
    offset.copyFrom(this.target.movement.position);
    offset.add(rnd.realInRange(-size, size), rnd.realInRange(-size, size));
    ship.movement.plot({ x: this.offset.x-p1.x, y: this.offset.y-p1.y }, this.throttle);
  } else if(rnd.frac() < 0.5) {
    p2 = this.getHomePosition();
    distance = p2.distance(p1);
    ship.movement.plot({ x: p2.x-p1.x, y: p2.y-p1.y }, distance/7 );
  };
};

Scavenger.prototype.disengage = function() {
  // console.log('in disengage. queen cooldown is ', this.spawnQueenCooldown)
  var game = this.manager.game,
  durability;

  if(this.target && !this.target.disabled) {
    this.target = null;
    this.attacker && this.game.clock.events.remove(this.attacker);
  }
};


Scavenger.prototype.getHomePosition = function() {
  var position = this.settings.position,
      sensor = this.sensor;
      sensor.setTo(-9360, 11750, position.radius);
      var a = /^(mol)/
      var t = this.ship.data.name;
      // console.log(a.test(t))
      if(a.test(t)){
        sensor.setTo(9200, -11100, position.radius);
      }
      // debugger
  return this.sensor.random();
};

module.exports = Scavenger;
