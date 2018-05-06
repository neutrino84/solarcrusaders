var engine = require('engine'),
    Basic = require('./Basic');

function Pirate(ship, faction) {
  Basic.call(this, ship);

  this.type = 'pirate';
  if(ship.tutorialTargetID){
    this.tutorialTargetID = ship.tutorialTargetID;
  }
  this.attackingStation = false; 
  this.settings = client.AIConfiguration[this.type];

  this.friendlies = this.settings.friendly;

  this.faction = faction;
};

Pirate.prototype = Object.create(Basic.prototype);
Pirate.prototype.constructor = Pirate;

Pirate.prototype.engage = function(target) {
  var settings = this.settings,
      ship = this.ship,
      health = ship.data.health / ship.config.stats.health;
    if(this.attackingStation){
    }
  // finish attack
  if(!this.target && !this.friendly(target)) {
    this.target = target;

    this.attacker && this.game.clock.events.remove(this.attacker);
    this.attacker = this.game.clock.events.loop(ship.data.rate, this.attack, this);

    if(!this.attackingStation){
    this.disengager && this.game.clock.events.remove(this.disengager);
    this.disengager = this.game.clock.events.add(settings.disengage, this.disengage, this);
    }
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

Pirate.prototype.friendly = function(target) {
  var settings = this.settings;
  if(this.attackingStation){
    return false;
  }
  if(target.ai && settings.friendly.indexOf(target.ai.type) >= 0) { return true; }
  if(target.user && settings.friendly.indexOf('user') >= 0) { return true; }
  return false;
};

Pirate.prototype.update = function() {
  // if(!this.game){return}
  var ship = this.ship,
      sensor = this.sensor,
      offset = this.offset,
      settings = this.settings,
      rnd = this.game.rnd,
      p1, p2, size, health;

  p1 = ship.movement.position;
  sensor.setTo(p1.x, p1.y, settings['sensor_' + this.faction].range);
  health = ship.data.health / ship.config.stats.health;

  // retreat due to damage
  if(health < settings.escape.health && !this.tutorialTarget) {
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

Pirate.prototype.scanner = function() {
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

  if(this.attackingStation){return}
  // scan nearby ships
  if(this.tutorialTargetID){
    ship = ships[this.tutorialTargetID]
    this.engage(ship);
  }
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

Pirate.prototype.attack = function() {
  var ship = this.ship,
      settings = this.settings,
      offset = this.offset,
      rnd = this.game.rnd,
      target, size,
      point = {};

  // attack sequence
  if(this.target && this.target.data && !this.attackingStation) {
    target = this.target;

    size = target.data.size * settings['sensor_' + this.faction].aim;
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
  } else if(this.target && this.target.data && this.attackingStation){
  	target = this.target;

  	size = target.data.size/9 * (settings['sensor_' + this.faction].aim - 0.1);
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

Pirate.prototype.plot = function(){
  // plot destination
  var rnd = this.game.rnd,
      ship = this.ship,
      sensor = this.sensor,
      p1 = ship.movement.position,
      settings = this.settings,
      offset = this.offset,
      size, distance;
      // return
  sensor.setTo(p1.x, p1.y, settings['sensor_' + this.faction].range);    
  
  if(!this.retreat && this.target && this.target.data){
  	if(this.attackingStation){
  		// if(this.game.rnd)
  		size = this.target.data.size;
  		distance = this.target.movement.position.distance(p1)
  		offset.copyFrom(this.target.movement.position);
  		offset.add(rnd.realInRange(-size, size), rnd.realInRange(-size, size));
  		if(this.game.rnd.frac() > 0.1){
  			ship.movement.plot({ x: this.offset.x-p1.x, y: this.offset.y-p1.y}, distance/2);
  		} else {
  			ship.movement.plot({ x: this.offset.x-p1.x, y: this.offset.y-p1.y}, distance);
  		}
  	} else {
  	 size = this.target.data.size * 4;
  	 distance = this.target.movement.position.distance(p1)
  	 offset.copyFrom(this.target.movement.position);
  	 offset.add(rnd.realInRange(-size, size), rnd.realInRange(-size, size));
  	 ship.movement.plot({ x: this.offset.x-p1.x, y: this.offset.y-p1.y }, this.throttle);
  	 // ship.movement.plot({ x: this.offset.x-p1.x, y: this.offset.y-p1.y });
  	}
  } else if(!this.tutorialTargetID && rnd.frac() < 0.65 || this.retreat && !this.tutorialTargetID) {
    p2 = this.getHomePosition();
    if(p2){
      distance = p2.distance(p1);
      ship.movement.plot({ x: p2.x-p1.x, y: p2.y-p1.y }, distance/8 );
    };
  };
};

Pirate.prototype.engageStation = function(station) {
	var ship = this.ship;
  this.attackingStation = true;
  this.engage(station)
  // debugger
  this.game.clock.events.add(10000, function(){
    if(this.ship){
  	 this.ship.activate('booster'); 
    }
  }, this);
};
Pirate.prototype.engagePlayer = function(target) {
  var ship = this.ship;

  if(ship.faction !== 'tutorial'){return}
  this.target = target;
  this.attackingStation = true;
  this.engage(target);
};
Pirate.prototype.disengage = function() {
  if(this.attackingStation){
  	this.attackingStation = false;
  }
  this.target = null;
  this.attacker && this.game.clock.events.remove(this.attacker);
};

Pirate.prototype.getHomePosition = function() {
  var position = this.settings['position_' + this.faction],
      sensor = this.sensor;
      if(!position){return}
      sensor.setTo(position.x, position.y, position.radius);
  return sensor.random();
};

module.exports = Pirate;
