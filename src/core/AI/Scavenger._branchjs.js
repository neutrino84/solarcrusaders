var engine = require('engine'),
    Basic = require('./Basic'),
    client = require('client');
    // Generator = require('../utils/Generator');

function Scavenger(ship, home) {
  Basic.call(this, ship);

  this.type = 'scavenger';
  this.attacking = false;

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
  if(ship.chassis === 'scavenger-x04' || ship.chassis === 'scavengers-x03c'){
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
  if(ship.chassis === 'scavengers-x01' || ship.chassis === 'scavengers-x02'){
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
  if(ship.chassis === 'scavengers-x04d'){
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
      targets = Ob
ject.keys(priority.enemy);
      // targets.length && this.engage(priority.enemy[targets.sort(ascending)[0]]);
      // targets.length && this.engage();
      this.target = priority.enemy[targets.sort(ascending)[0]];
      this.attacker && this.game.clock.events.remove(this.attacker);
      this.attacker = this.game.clock.events.loop(ship.data.rate, this.attack, this);

      this.disengager && this.game.clock.events.remove(this.disengager);
      this.disengager = this.game.clock.events.add(settings.disengage, this.disengage, this);
    }
  };
  if(ship.chassis === 'scavengers-x03c' && this.master){
    master = ships[this.master];
    position = master.movement.position
    if(this.attacking){return}

    size = master.data.size * 1.5;
    position.add(rnd.realInRange(-size, size), rnd.realInRange(-size, size));
    // ship.movement.plot({ x: this.offset.x-p1.x, y: this.offset.y-p1.y }, this.throttle);

    ship.movement.plot({ x: position.x - ship.movement.position.x, y: position.y - ship.movement.position.y })
  }
};

Scavenger.prototype.engage = function(target) {
  var settings = this.settings,
      ship = this.ship,
      health = ship.data.health / ship.config.stats.health;

  // finish attack
  if(this.target == null && !this.friendly(target)) {
    this.target = target;
    // console.log('in scav engage function. about to start the attacker')
    this.attacker && this.game.clock.events.remove(this.attacker);
    this.attacker = this.game.clock.events.loop(ship.data.rate, this.attack, this);

    this.disengager && this.game.clock.events.remove(this.disengager);
    this.disengager = this.game.clock.events.add(settings.disengage, this.disengage, this);
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
  // if(this.ship.data.chassis === 'scavengers-x04d' && this.game.rnd.frac() < 0.70) {
  //   ship.activate('booster');
  //   // console.log('scav queen boost')
  // }
};

Scavenger.prototype.attack = function(){
    if(!this.target){return}
    if(this.target.data.chassis === 'scavengers-x02' || this.target.data.chassis === 'scavengers-x01' || this.target.data.chassis === 'scavengers-x03c' || this.target.data.chassis === 'scavengers-x04d'){this.target = null; return}
    if(this.ship.chassis === 'scavengers-x03c' || this.ship.chassis === 'scavengers-x04d'){
      if(this.target && !this.target.disabled){
      Basic.prototype.attack.call(this)
      this.attacking = true;
      } else if(this.target && this.target.disabled) {
        this.disengage();
      }
    } else if(this.target && this.target.disabled && this.target.durability > 0 ){
    Basic.prototype.attack.call(this)
    } else if(this.target && !this.target.disabled) {
      this.disengage();
    };
};


Scavenger.prototype.disengage = function() {
  var game = this.manager.game,
  durability;

  // if(this.target && this.target.ai === null){
    // console.log('trying to disengage from user. target is ', this.target.data.chassis)
  // }

  if(this.ship.hardpoints[0].subtype === 'harvester' && this.target && !this.target.disabled) {
    this.target = null;
    this.attacking = false;
    this.attacker && this.game.clock.events.remove(this.attacker);
  };

  if(this.ship.hardpoints[0].subtype === 'disintegrator' && this.target) {
    this.target = null;
    this.attacking = false;
    this.attacker && this.game.clock.events.remove(this.attacker);
  };

  // if(this.target && this.target.ai === null){
    // console.log('222trying to disengage from user. target is ', this.target.data.chassis)
  // }

};

Scavenger.prototype.update = function() {
  var ship = this.ship,
      ships = this.manager.ships,
      settings = this.settings,
      rnd = this.game.rnd,
      master,
      p1, p2, size, health, masterHealth;

  if(ship.master){
    master = this.manager.ships[ship.master];
    if(!master.disabled && master.ai.target && !this.attacking){
      // this.engage(master.ai.target) 
      this.target = master.ai.target
      this.attacker && this.game.clock.events.remove(this.attacker);
      this.attacker = this.game.clock.events.loop(ship.data.rate, this.attack, this);

      this.disengager && this.game.clock.events.remove(this.disengager);
      this.disengager = this.game.clock.events.add(settings.disengage, this.disengage, this);
    }
  };

  // retreat due to damage
  if(health < settings.escape.health) {
    this.retreat = true;
  } else {
    this.retreat = false;
  }

  // target ships
  if(rnd.frac() < 0.8) {
    this.scanner();
  };

  this.plot();
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
