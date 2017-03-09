
var async = require('async'),
    engine = require('engine'),
    client = require('client'),
    System = require('./System'),
    Hardpoint = require('./Hardpoint'),
    Utils = require('../../utils');

function Station(manager, data) {
  this.manager = manager;
  this.game = manager.game;
  this.sockets = manager.sockets;
  this.model = manager.model;
  
  this.uuid = this.data.uuid;

  this.disabled = false;
};

Station.prototype.constructor = Station;

Station.prototype.init = function(callback) {
  this.createHardpoints();
  callback();
};

/*
 * Hardpoint Factory
 */
Station.prototype.createHardpoints = function() {
  var hardpoint, type, subtype, stats,
      hardpoints = this.config.targeting.hardpoints,
      length = hardpoints.length;

  // create turrets
  for(var i=0; i<length; i++) {
    stats = hardpoints[i];

    if(stats.default && stats.default.subtype) {
      type = stats.default.type;
      subtype = stats.default.subtype;
    } else if(stats.type && stats.type.indexOf('projectile') > -1) {
      type = 'rocket';
    } else {
      type = 'pulse';
    }

    // cache to local object
    this.hardpoints[i] = new Hardpoint(i, type, subtype).toObject(); 
  }
};

Station.prototype.attack = function(data, rtt) {
  if(this.disabled) { return; }

  var attacker = this,
      game = this.game,
      sockets = this.sockets,
      ships = this.manager.ships,
      movement = this.movement,
      hardpoints = this.hardpoints,
      time, hardpoint, compensated,
      target = data.targ,
      distance;

  // get updated data
  compensated = movement.compensated(rtt);
  distance = compensated.distance(target);

  // validate attack
  for(var slot in hardpoints) {
    hardpoint = hardpoints[slot];

    if(distance <= hardpoint.range) {
      // compute travel time
      time = distance * hardpoint.projection + hardpoint.delay;

      // time collisions
      game.clock.events.add(time, this.attacked, this, target, slot);

      // broadcast ataack
      sockets.io.sockets.emit('ship/attack', data);
    }
  }
};

Station.prototype.attacked = function(target, slot) {
  var ship, ships,
      manager = this.manager;
  if(manager != undefined) {
    ships = manager.ships;
    for(var s in ships) {
      ship = ships[s];
      if(ship.game && ship != this) {
        ship.hit(this, target, slot);
      }
    }
  }
};

Station.prototype.hit = function(attacker, target, slot) {
  var updates = [],
      sockets = this.sockets,
      movement = this.movement,
      data = this.data,
      ai = this.ai,
      hardpoint = attacker.hardpoints[slot],
      compensated = movement.compensated(),
      distance = compensated.distance(target),
      ratio = distance / (this.size * hardpoint.aoe),
      damage, health;
  if(ratio < 1.0) {
    // test data
    // if(!attacker.ai && this.ai) {
    //   sockets.io.sockets.emit('ship/test', {
    //     uuid: this.uuid,
    //     compensated: compensated,
    //     targ: target
    //   });
    // }

    // calc damage
    damage = global.Math.max(0, hardpoint.damage * (1-ratio) - this.armor);
    health = data.health-damage;

    // update damage
    if(!this.disabled && health > 0) {
      // update health
      data.health = health;
      updates.push({
        uuid: this.uuid,
        attacker: attacker.uuid,
        health: data.health,
        damage: damage
      });

      // update attacker
      attacker.credits = global.Math.floor(attacker.credits + damage + (ai && ai.type === 'pirate' ? damage : 0));
      updates.push({
        uuid: attacker.uuid,
        credits: attacker.credits,
        hardpoint: {
          ship: this.uuid,
          slot: hardpoint.slot,
          target: target,
          damage: damage
        }
      });

      // defend
      ai && ai.engage(attacker);
    } else {
      // disengage attacker
      attacker.ai && attacker.ai.disengage();

      // disable ship
      if(!this.disabled) {
        this.disable();
        
        // update attacker reputation
        attacker.reputation = global.Math.floor(attacker.reputation + (this.reputation * -0.05));
        updates.push({
          uuid: attacker.uuid,
          reputation: attacker.reputation
        });
      }
    }

    // broadcast
    if(updates.length) {
      sockets.io.sockets.emit('ship/data', {
        type: 'update', ships: updates
      });
    }
  }
};

Station.prototype.disable = function() {
  this.disabled = true;
  this.ai && this.ai.disengage();
  this.timer = this.game.clock.events.add(this.ai ? this.ai.settings.respawn : 10000, this.enable, this);
  this.sockets.io.sockets.emit('ship/disabled', {
    uuid: this.uuid
  });
};

Station.prototype.destroy = function() {
  var enhancements = this.enhancements,
      available = enhancements.available;
  for(var e in available) {
    available[e].destroy();
  }
  this.ai && this.ai.destroy();
  this.timer && this.game.clock.events.remove(this.timer);
  this.manager = this.game =
    this.data = this.user = this.sockets =
    this.config = this.systems = this.timers =
    this.enhancements = this.hardpoints =
    this.data = undefined;
};

module.exports = Station;
