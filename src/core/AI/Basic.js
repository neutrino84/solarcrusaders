
var engine = require('engine');

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

  this.settings = {
    respawn: 30000,
    disengage: 7680,
    friendly: ['basic','user','scavenger'],
    position: {
      radius: 4096,
      x: 2048,
      y: 2048
    },
    escape: {
      health: 0.25,
    },
    sensor: {
      aim: 1.5,
      range: 4096
    }
  };
};

Basic.prototype.constructor = Basic;

Basic.prototype.update = function() {
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

  // target ships
  if(rnd.frac() < 0.8) {
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
  targets.length && this.engage(priority.enemy[targets.sort(ascending)[0]]);
};

Basic.prototype.friendly = function(target) {
  var settings = this.settings;
  if(target.ai && settings.friendly.indexOf(target.ai.type) >= 0) { return true; }
  if(target.user && settings.friendly.indexOf('user') >= 0) { return true; }
  return false;
};

Basic.prototype.engage = function(target) {
  var settings = this.settings,
      ship = this.ship,
      health = ship.data.health / ship.config.stats.health;

  // finish attack
  if(this.target == null && !this.friendly(target)) {
    this.target = target;

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
};

Basic.prototype.reengage = function() {

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
  if(this.target) {
    target = this.target;

    size = target.data.size * settings.sensor.aim;
    offset.copyFrom(target.movement.position);
    offset.add(rnd.realInRange(-size, size), rnd.realInRange(-size, size));

    // attack
    ship.attack({
      uuid: ship.uuid,
      targ: {
        x: offset.x,
        y: offset.y
      }
    });
  }
};

Basic.prototype.plot = function(){
  var rnd = this.game.rnd,
      ship = this.ship,
      p1 = ship.movement.position,
      sensor = this.sensor,
      settings = this.settings,
      offset = this.offset,
      size;

  sensor.setTo(p1.x, p1.y, settings.sensor.range);
      
  // plot destination
  if(!this.retreat && this.target) {
    size = this.target.data.size * 4;
    offset.copyFrom(this.target.movement.position);
    offset.add(rnd.realInRange(-size, size), rnd.realInRange(-size, size));
    ship.movement.plot({ x: this.offset.x-p1.x, y: this.offset.y-p1.y }, this.throttle);
  } else if(rnd.frac() < 0.1) {
    p2 = this.getHomePosition();
    ship.movement.plot({ x: p2.x-p1.x, y: p2.y-p1.y });
  };
};

Basic.prototype.getHomePosition = function() {
  return this.manager.generateRandomPosition(1024);
};

Basic.prototype.destroy = function() {
  this.disengager && this.game.clock.events.remove(this.disengager);
  this.attacker && this.game.clock.events.remove(this.attacker);
  this.ship = this.game = this.manager = this.offset =
    this.timer = this.target = this.aim = undefined;
};

module.exports = Basic;
