var engine = require('engine'),
    Basic = require('./Basic');

function Scavenger(ship, home) {
  Basic.call(this, ship);

  this.type = 'scavenger';
  this.spawnQueenThreshold = 500;
  this.nextSpawnQueenThreshold = 500;
  this.spawnQueenCooldown = false;

  // timer events
  this.events = new engine.Timer(this.game, false);

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
    // if(target.durability < 1){this.disengage()}

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
    if(this.target && this.target.disabled && this.target.durability > 0){
    Basic.prototype.attack.call(this)
    } else if(this.target) {
      this.disengage();
    }
  
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
    ship.movement.plot({ x: p2.x-p1.x, y: p2.y-p1.y }, distance/3 );
  };
};

Scavenger.prototype.spawnQueenCheck = function(){
  console.log('spawn queen check. threshold is ', this.spawnQueenThreshold);
  this.spawnQueenThreshold -= this.target.config.stats.durability/3
  console.log(this.spawnQueenThreshold);
  if(this.spawnQueenThreshold <= 0){
    this.spawnQueenThreshold = this.nextSpawnQueenThreshold;
    this.nextSpawnQueenThreshold = this.nextSpawnQueenThreshold + 500;
    console.log('SPAWN ', this.spawnQueenThreshold)
  }
};

Scavenger.prototype.disengage = function() {
    if(!this.spawnQueenCooldown){
      this.spawnQueenCooldown = true;
      this.timer && this.events.remove(this.timer);
      this.timer = this.events.add(10000, function() {
        this.spawnQueenCheck();
        this.spawnQueenCooldown = false;
      }, this);
    }
 

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
