var engine = require('engine'),
    Basic = require('./Basic');
    // Generator = require('../utils/Generator');

function Scavenger(ship, home) {
  Basic.call(this, ship);

  this.type = 'scavenger';
  this.spawnQueenThreshold = 500;
  this.nextSpawnQueenThreshold = 1000;
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
    ship.movement.plot({ x: p2.x-p1.x, y: p2.y-p1.y }, distance/7 );
  };
};

Scavenger.prototype.spawnQueenCheck = function(durability){
  // console.log('threshold is ', this.spawnQueenThreshold, 'durability is', durability);
  // console.log('TIMER FINISHED')
  var game = this.manager.game;
  // console.log('ummm')
  game.clock.events.add(15000, function(){
    this.spawnQueenCooldown = false;
    // console.log('spawn reset')
  })

  this.spawnQueenThreshold -= durability
  // console.log('new threshold is ', this.spawnQueenThreshold);
  if(this.spawnQueenThreshold <= 0){
    this.spawnQueenThreshold = this.nextSpawnQueenThreshold;
    this.nextSpawnQueenThreshold = this.nextSpawnQueenThreshold + 500;
    // console.log('SPAWN ', this.spawnQueenThreshold)
    this.manager.spawnQueen()
    // if(!this.spawnQueenCooldown){
    //   this.manager.create({
    //     name: 'Queen',
    //     chassis: 'scavengers-x04d',
    //     credits: global.Math.floor(5000 * global.Math.random() + 100),
    //     reputation: global.Math.floor(-100 * (1 + global.Math.random())),
    //     throttle: 1.0,
    //     ai: 'pirate',
    //     x: -8192,
    //     y: 8192
    //   });
    // };
  }
};

Scavenger.prototype.disengage = function() {
  // console.log('in disengage. queen cooldown is ', this.spawnQueenCooldown)
  var game = this.manager.game,
  durability;

    if(!this.spawnQueenCooldown && this.target){
      durability = this.target.config.stats.durability;
      // console.log('BEGIN 10 SECOND TIMER', this.spawnQueenCooldown)
      this.spawnQueenCooldown = true;
      game.clock.events.add(10000, function() {
        this.spawnQueenCheck(durability);
        // this.spawnQueenCooldown = false;
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
