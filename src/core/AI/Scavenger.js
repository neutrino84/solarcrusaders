var engine = require('engine'),
    Basic = require('./Basic');

function Scavenger(ship, faction) {
  

  Basic.call(this, ship);

  this.type = 'scavenger';

  this.settings = client.AIConfiguration[this.type];

  this.friendlies = this.settings.friendly;

  this.faction = faction;
  // console.log('wtf ', faction, this.faction)

  // if(Math.random() >= 0.5){
  //   this.faction = 'vulothi'
  // } else {
  //   this.faction = 'fenris'  
  // }
  // console.log(ship.data)
  // debugger
  
  // console.log(ship.data)
  // debugger

  // this.settings = {
  //   disengage: 9216,
  //   friendly: ['scavenger'],
  //   position: {
  //     radius: 128,
  //     x: ship.movement.position.x,
  //     y: ship.movement.position.y
  //   },
  //   bounds: false,
  //   escape: {
  //     health: 0.5,
  //   },
  //   sensor: {
  //     aim: 0.8,
  //     range: 16384
  //   }
  // }

  if(ship.chassis === 'scavenger-x04' || ship.chassis === 'scavenger-x03'){
    this.settings = client.AIConfiguration['scavenger-hostile'];
  }
};

Scavenger.prototype = Object.create(Basic.prototype);
Scavenger.prototype.constructor = Scavenger;

Scavenger.prototype.scanner = function() {
  var target, targets, scan, distance,
      settings = this.settings,
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
      }, 
      rnd = this.game.rnd,
      queen, position, size;

  switch(ship.chassis) {
    case 'scavenger-x01' || 'scavenger-x02':
      if(this.target == null) {
        // scan nearby ships
        for(var s in ships) {
          scan = ships[s];
          p2 = scan.movement.position;

          if(scan.disabled && !this.friendly(scan) && sensor.contains(p2.x, p2.y)) {
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
      };
      break

    case 'scavenger-x03':
      if(this.attacking){return}
      if(ship.queen){queen = ships[ship.queen]}
        // console.log(queen)
      // debugger
      position = queen.movement.position;
      size = queen.data.size * 1.5;
      position.add(rnd.realInRange(-size, size), rnd.realInRange(-size, size));
      // ship.movement.plot({ x: this.offset.x-p1.x, y: this.offset.y-p1.y }, this.throttle);
      ship.movement.plot({ x: position.x - ship.movement.position.x, y: position.y - ship.movement.position.y })
      break;

    case 'scavenger-x04':
      if(this.target == null) {
        for(var s in ships) {
          scan = ships[s];
          p2 = scan.movement.position;
          // if(scan.chassis === 'ubaidian-x01d'){console.log(scan)}
          if(scan.disabled) { continue; }
          // console.log('sensor is ', sensor)
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
        // targets.length && this.engage(priority.enemy[targets.sort(ascending)[0]]);

        // targets.length && this.engage();
        this.target = priority.enemy[targets.sort(ascending)[0]];
        // if(this.target){console.log('scanning, target is ', this.target.chassis)}
        this.attacker && this.game.clock.events.remove(this.attacker);
        this.attacker = this.game.clock.events.loop(ship.data.rate, this.attack, this);

        this.disengager && this.game.clock.events.remove(this.disengager);
        this.disengager = this.game.clock.events.add(settings.disengage, this.disengage, this);
      }
      break;

    default:
      break;
  }
};

Scavenger.prototype.update = function() {
  var ship = this.ship,
      ships = this.manager.ships,
      settings = this.settings,
      rnd = this.game.rnd,
      queen,
      p1, p2, size, health, queenHealth;
  if(this.ship.chassis === 'scavenger-x04'){
    // console.log('in update. target is ', this.target.chassis)
  }

  if(ship.queen){
    queen = this.manager.ships[ship.queen];
    if(!queen.disabled && queen.ai.target && !this.attacking){
      // this.engage(queen.ai.target) 
      this.target = queen.ai.target
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
  if(rnd.frac() < 0.6) {
    this.scanner();
  };


  this.plot();
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
  }
};

Scavenger.prototype.disengage = function() {
  var durability;

 if(this.ship.hardpoints[0].subtype === 'disintegrator' && this.target) {
   this.target = null;
   this.attacking = false;
   this.attacker && this.game.clock.events.remove(this.attacker);
 };

  //CHECK SHIP.JS UPDATE FOR DURABILITY CHECK

  if(this.ship.hardpoints[0].subtype === 'harvester' && this.target && !this.target.disabled) {
    this.target = null;
    this.attacking = false;
    this.attacker && this.game.clock.events.remove(this.attacker);
  };
};

Scavenger.prototype.attack = function(){
    if(!this.target){return}
    var a = /^(scavenger)/,
        chassis = this.target.data.chassis;
    // console.log(a.test(t))
    if(a.test(chassis)){
      this.target = null; return
    }
    
    if(this.ship.chassis === 'scavenger-x03' || this.ship.chassis === 'scavenger-x04'){
      if(this.target && !this.target.disabled){
        // console.log('attacking ', this.target.chassis)
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

Scavenger.prototype.plot = function(){
  // plot destination
  var rnd = this.game.rnd,
      ship = this.ship,
      sensor = this.sensor,
      p1 = ship.movement.position,
      settings = this.settings,
      offset = this.offset,
      size, distance;
      // return
  sensor.setTo(p1.x, p1.y, settings.sensor.range);    

  if(!this.retreat && this.target && this.target.durability > 0) {
    size = this.target.data.size * 4;
    offset.copyFrom(this.target.movement.position);
    offset.add(rnd.realInRange(-size, size), rnd.realInRange(-size, size));
    ship.movement.plot({ x: this.offset.x-p1.x, y: this.offset.y-p1.y }, this.throttle);
  } else if(rnd.frac() < 0.65) {
    p2 = this.getHomePosition();
    distance = p2.distance(p1);
    ship.movement.plot({ x: p2.x-p1.x, y: p2.y-p1.y }, distance/7 );
  };
};

Scavenger.prototype.getHomePosition = function() {
  var position = this.settings.position,
      sensor = this.sensor,
      random_boolean = Math.random() >= 0.5;
      if(this.faction === 'vulothi'){
        sensor.setTo(5411, -5354, 800);
      } else if(this.faction === 'fenris'){
        sensor.setTo(position.x, position.y, 800);
      }
  return this.sensor.random();
};

// Scavenger.prototype.update = function() {
  
// }

module.exports = Scavenger;
