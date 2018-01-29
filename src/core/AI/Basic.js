
var engine = require('engine'),
    Station = require('../objects/Station');

function Basic(parent) {
  this.type = 'basic';

  this.parent = parent;
  this.game = parent.game;

  this.target = null;
  this.attacks = 0;
  this.sleep = 0;
  this.started = 0;
  this.elapsed = 0;
  this.waypoints = [];
  this.targets = [];

  // sensor helper
  this.sensor = new engine.Circle();

  this.settings = {
    friendly: ['basic', 'user'],
    sensor: {
      aim: 1.25,
      range: 2048
    }
  };
};

Basic.prototype.constructor = Basic;

Basic.prototype.update = function() {
  var game = this.game,
      sensor = this.sensor,
      parent = this.parent,
      settings = this.settings;

  // started 
  this.elapsed = game.clock.time-this.started;
  this.started = game.clock.time;

  // update ship sensor
  this.sensor.copyFrom(this.parent.movement.position);
  this.sensor.radius = settings.sensor.range;

  // plot
  this.scan();
  this.defense();
  this.plot();
};

Basic.prototype.scan = function() {
  var game = this.game,
      parent = this.parent,
      sensor = this.sensor,
      targets = [],
      ships = game.ships,
      stations = game.stations,
      master = parent.master,
      ship, station, position, distance, target,
      prioritize = function(a, b) {
        var at = a.target instanceof Station,
            bt = b.target instanceof Station;
        if(at || bt) {
          if(at) {
            return -1;
          } else if(bt) {
            return 1;
          }
          return 0;
        }
        return a.distance-b.distance;
      };

  // check if focus fire command
  // has been enabled
  if(master && master.commands['supress']) {
    // cancel all attack functions
    return;
  } else if(master && master.targets.length && master.commands['focus']) {
    // set master targets
    // as local targets
    // to focus fire
    for(var i=0; i<master.targets.length; i++) {
      target = master.targets[i];

      // target only viable enemies
      if(!target.disabled && !this.friendly(target)) {
        position = target.movement.position;

        // disabled
        if(sensor.contains(position.x, position.y)) {
          distance = position.distance(parent.movement.position);
          targets.push({
            distance: distance,
            target: target
          });
        }
      }
    }
  } else {
    // scan nearby ships
    for(var s in ships) {
      ship = ships[s];
      position = ship.movement.position;

      // disabled
      if(!ship.disabled && !this.friendly(ship)) { 
        if(sensor.contains(position.x, position.y)) {
          distance = position.distance(parent.movement.position);
          targets.push({
            distance: distance,
            target: ship
          });
        }
      }
    }

    // scan nearby stations
    for(var s in stations) {
      station = stations[s];
      position = station.movement.position;

      // disabled
      if(!station.disabled && station.race !== parent.race) {
        if(sensor.contains(position.x, position.y)) {
          distance = position.distance(parent.movement.position);
          targets.push({
            distance: distance,
            target: station
          });
        }
      }
    }
  }

  // prepare attack
  if(targets.length > 0) {
    // sort by priority
    targets.sort(prioritize);

    // engage high
    // priority targets
    target = engine.Utility.random(targets, 0, 3);
    target && this.engage(target.target);
  }
};

Basic.prototype.friendly = function(target) {
  var parent = this.parent,
      settings = this.settings,
      friendly = settings.friendly;
  if(target.user && friendly.indexOf('user') >= 0) { return true; }
  if(target.ai && friendly.indexOf(target.ai.type) >= 0) { return true; }
  if(target.master && target.master && friendly.indexOf(target.master.ai.type) >= 0) { return true; }
  return false;
};

Basic.prototype.attacked = function(target) {
  // if(!this.friendly(target)) {
  //   this.targets.push(target);
  // }
};

Basic.prototype.engage = function(target) {
  var game = this.game,
      settings = this.settings,
      parent = this.parent;

  // engage target
  if(this.attacks == 0 && this.sleep <= 0) {
    // start attack
    this.target = target;
    this.attacks = game.rnd.integerInRange(0, 4);
    this.sleep = game.rnd.integerInRange(0, 3 * parent.data.rate);

    // initial
    this.attack();

    // autofire attack
    this.attacking && game.clock.events.remove(this.attacking);
    this.attacking = game.clock.events.loop(parent.data.rate, this.attack, this);
  } else if(this.sleep > 0) {
    this.sleep -= this.elapsed;
  } else {
    this.disengage();
  }
};

Basic.prototype.disengage = function() {
  // remove target
  this.attacks = 0;
  this.attacking &&
    this.game.clock.events.remove(this.attacking);
};

Basic.prototype.attack = function() {
  var rnd = this.game.rnd,
      accuracy, position;

  // prepare attack
  if(!this.target.disabled) {
    // aim
    position = this.target.movement.position;
    accuracy = this.target instanceof Station ?
      this.target.data.size * 0.5 :
      this.target.data.size * this.settings.sensor.aim;

    // attack
    this.parent.attack({
      uuid: this.parent.uuid,
      targ: {
        x: position.x + rnd.realInRange(-accuracy, accuracy),
        y: position.y + rnd.realInRange(-accuracy, accuracy)
      }
    });

    // decrement
    // attacks
    this.attacks -= 1;
  }
};

Basic.prototype.defense = function() {
  var parent = this.parent,
      integrity = parent.integrity;

  // defensive
  // strategy
  if(integrity < 0.5) {
    parent.activate('shield');
  }
  if(integrity < 0.5) {
    parent.activate('heal');
  }
};

Basic.prototype.plot = function() {
  var waypoint, vector,
      game = this.game,
      parent = this.parent,
      target = this.target,
      settings = this.settings,
      waypoints = this.waypoints,
      elapsed = this.elapsed,
      radius, angle, coordinates;

  // create waypoint
  if(waypoints.length === 0) {
    if(target && !target.disabled) {
      radius = game.rnd.integerInRange(128, 768);
      angle = game.rnd.realInRange(0, 2.0 * global.Math.PI);
      waypoint = {
        destroy: false,
        started: false,
        continuous: true,
        wait: game.rnd.pick([0, 0, 0, 0, 0, 200]),
        lifespan: game.rnd.integerInRange(6200, 8800),
        coordinates: target.movement.position,
        // throttle: game.rnd.realInRange(0.75, 1.0),
        offset: {
          x: radius * global.Math.cos(angle),
          y: radius * global.Math.sin(angle)
        }
      };
    } else if(parent.station) {
      radius = game.rnd.integerInRange(parent.station.size * 0.8, parent.station.size * 1.6);
      angle = game.rnd.realInRange(0, 2.0 * global.Math.PI);
      waypoint = {
        destroy: false,
        started: false,
        continuous: game.rnd.pick([true, true, false]),
        wait: game.rnd.pick([0, 0, 0, 1200]),
        lifespan: game.rnd.integerInRange(14000, 22000),
        coordinates: parent.station.movement.position,
        offset: {
          x: radius * global.Math.cos(angle),
          y: radius * global.Math.sin(angle)
        }
      };
    }
    waypoints.push(waypoint);
  }

  // process waypoint
  if(waypoints.length > 0) {
    waypoint = waypoints[0];

    // basic waypoint
    if(waypoint.started == false) {
      waypoint.started = true;

      // calculate vector
      coordinates = engine.Point.add(waypoint.coordinates, waypoint.offset);
      vector = engine.Point.subtract(coordinates, parent.movement.position);
      
      // plot waypoint vector
      parent.movement.plot(vector, waypoint.throttle);
    } else {
      // lifespan
      waypoint.lifespan -= elapsed;

      // wait then destroy
      if(waypoint.lifespan + waypoint.wait <= 0) {
        waypoint.destroy = true;
      } else {
        waypoint.wait -= elapsed;
      }
      
      // plot continuously
      if(waypoint.continuous) {
        // calculate vector
        coordinates = engine.Point.add(waypoint.coordinates, waypoint.offset);
        vector = engine.Point.subtract(coordinates, parent.movement.position);
      
        // plot waypoint vector
        parent.movement.plot(vector, waypoint.throttle);
      } else {
        // waypoint lifespan
        if(waypoint.lifespan <= 0) {
          parent.movement.stop();
        }
      }

      // destruction
      if(waypoint.destroy) {
        waypoints.shift();
      }
    }
  }
};

Basic.prototype.destroy = function() {
  this.attacking && this.game.clock.events.remove(this.attacking);
  this.game = this.parent =
    this.target = this.targets = undefined;
};

module.exports = Basic;
