
var async = require('async'),
    engine = require('engine'),
    client = require('client'),
    Hardpoint = require('./Hardpoint'),
    Enhancement = require('./Enhancement'),
    Movement = require('./Movement'),
    Utils = require('../../utils');

function Ship(manager, data, user) {
  this.manager = manager;
  this.game = manager.game;
  this.sockets = manager.sockets;
  this.model = manager.model;
  this.user = user;
  
  this.data = new this.model.Ship(data);

  this.data.init();
  this.uuid = this.data.uuid;
  this.parent = this.data.parent;
  this.chassis = this.data.chassis;
  if(data.master){
    this.master = data.master
  };
  if(data.queen){
    this.queen = data.queen
  };
  if(user){
  this.squadron = data.squadron
  this.docked = true;
  };
  this.data.targettedBy = null;

  // ship configuration
  this.config = client.ShipConfiguration[this.data.chassis];

  this.data.credits = this.config.stats.size;
  if(this.data.chassis === 'scavenger-x02' || this.data.chassis === 'scavenger-x01'){
    this.data.credits = 25;
  }
  if(this.data.chassis === 'scavenger-x03'){
    this.data.credits = 250;
  }
  if(this.data.chassis === 'scavenger-x04'){
    this.data.credits = 575;
  }
  if(this.user){
    this.data.credits = this.config.stats.size*2
  }

  // disabled state
  this.disabled = false;

  // movement
  this.movement = new Movement(this);

  this.ai = manager.ai.create(data.ai, this, data.faction);

  // create metadata
  this.hardpoints = {};
  this.enhancements = {
    active: {
      recharge: {},
      heal: {},
      armor: {},
      rate: {},
      evasion: {},
      speed: {},
      critical: {}
    },
    available: {}
  };

  // serialized
  this.serialized = {
    hardpoints: [],
    enhancements: []
  }
};

Ship.prototype.constructor = Ship;

Ship.RESPAWN_TIME = 10000;

Ship.prototype.init = function(callback) {
  var self = this,
      data = this.data,
      initialize = function() {
        self.createRelationships();
        self.createEnhancements();
        self.createHardpoints();
      };
  if(data.isNewRecord()) {
    initialize();
    callback();
  } else {
    async.series([
      data.reload.bind(data)
    ], function(err, results) {
      initialize();
      callback();
    });
  }
};

Ship.prototype.save = function(callback) {
  var self = this,
      user = this.user;
  if(user && !user.data.isNewRecord()) {
    async.series([
      function(next) {
        self.data.fk_sector_ship = 1;
        self.data.fk_user_ship = user.data.id;
        self.data.x = self.movement.position.x;
        self.data.y = self.movement.position.y;
        self.data.save(next);
      }
    ], callback);
  } else {
    callback();
  }
};

Ship.prototype.createRelationships = function() {
  this.user && this.user.ships.push(this);
};

Ship.prototype.createEnhancements = function() {
  var enhancement,
      enhancements = this.config.enhancements,
      available = this.enhancements.available,
      serialized = this.serialized;
  for(var i=0; i<enhancements.length; i++) {
    available[enhancements[i]] = new Enhancement(this, enhancements[i]);
    serialized.enhancements.push(enhancements[i]);
  }
};

Ship.prototype.createHardpoints = function() {
  var hardpoint, type, subtype, stats,
      harpoints = this.hardpoints,
      serialized = this.serialized,
      config = this.config.targeting.hardpoints;

  // create turrets
  for(var i=0; i<config.length; i++) {
    stats = config[i];

    if(stats.default && stats.default.type && stats.default.subtype) {
      type = stats.default.type;
      subtype = stats.default.subtype;
    } else {
      type = 'pulse';
      subtype = 'basic';
    }

    // cache to local object
    harpoints[i] = new Hardpoint(this, type, subtype, i);
    serialized.hardpoints.push(harpoints[i].toObject());
  }
};

Ship.prototype.attack = function(data, rtt) {
  if(this.disabled) { return; }

  var attacker = this,
      game = this.game,
      sockets = this.sockets,
      ships = this.manager.ships,
      movement = this.movement,
      hardpoints = this.hardpoints,
      runtime, hardpoint, compensated,
      target = data.targ,
      target_uuid = data.target,
      distance,
      rtt = rtt || 0;

  // get updated data
  compensated = movement.compensated(rtt);
  distance = compensated.distance(target);

  // validate attack
  for(var slot in hardpoints) {
    hardpoint = hardpoints[slot];
    
    if(distance <= hardpoint.data.range) {
      // compute travel time
      runtime = distance * hardpoint.data.projection + hardpoint.data.delay;

      // time collisions
      game.clock.events.add(runtime, this.attacked, this, target, slot, target_uuid);
    }
  }
  // broadcast atack
  sockets.send('ship/attack', data);
};

Ship.prototype.attacked = function(target, slot, target_uuid) {
  var ship, ships,
      stations = this.game.sectorManager.stationManager.stations,
      manager = this.manager;
  if(manager != undefined) {
    ships = manager.ships;
    for(var s in ships) {
      ship = ships[s];

      //*** shouldn't this check to see if you're in a damageable area before calling hit? 
        //  right now it's calling hit on all ships
      if(ship.game && ship != this) {
        ship.hit(this, target, slot, target_uuid);
      }
    };
    // for(var st in stations){
    //     stations[st].hit(this, target, slot);
    // };
  };
};

Ship.prototype.hit = function(attacker, target, slot, target_uuid) {
  var updates = [],
      sockets = this.sockets,
      movement = this.movement,
      data = this.data,
      ai = this.ai,
      durability = this.durability,
      hardpoint = attacker.hardpoints[slot],
      piercing = attacker.enhancements.active.piercing,
      compensated = movement.compensated(),
      distance = compensated.distance(target),
      ratio = distance / (this.size * hardpoint.data.aoe),
      damage, rawDamage, health, critical, shielded, durability, masterShip;
  if(ratio < 1.0) {
    // // test data
    // if(!attacker.ai && this.ai) {
    //   sockets.send('ship/test', {
    //     uuid: this.uuid,
    //     compensated: compensated,
    //     targ: target
    //   });
    // }
    if(attacker.hardpoints[0].subtype === 'harvester' && this.uuid !== target_uuid){
      return
    }

    //prevent friendly fire dmg to squadron
    if(this.master === attacker.uuid || attacker.hardpoints[0].subtype === 'repair' && data.health >= (this.config.stats.health)){return}  


    // calc damage
    critical = this.game.rnd.rnd() <= attacker.critical;
    damage = global.Math.max(0, hardpoint.data.damage * (1-ratio));
    rawDamage = global.Math.max(0, hardpoint.data.damage * (1-ratio));
    if(attacker.hardpoints[0].subtype !== 'repair'){
      damage = damage * (1-this.armor)
    };
    damage += critical ? damage : 0;
    damage *= piercing ? piercing.damage : 1.0;
    if(this.squadron && this.shieldCheck(this.uuid)){
        damage = damage*0.65;
        shielded = true;
    };
    if(attacker.hardpoints[0].subtype === 'repair'){
      if(data.health < this.config.stats.health){
        health = data.health + rawDamage
      } else {
        health = data.health
      }
    } else {
      health = data.health - damage;
    }

    durability = this.durability;

    // update damage
    if(!this.disabled && health > 0) {
      // update health
      data.health = health;
      updates.push({
        uuid: this.uuid,
        attacker: attacker.uuid,
        health: data.health,
        damage: damage,
        critical: critical,
        shielded: shielded
      });

      updates.push({
        uuid: attacker.uuid,
        // credits: attacker.credits,
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

        if(attacker.master && this.manager){
          masterShip = this.manager.ships[attacker.master];
          masterShip.credits = masterShip.credits + this.data.credits;

          updates.push({
          uuid: masterShip.uuid,
          credits: masterShip.credits,
          reputation: masterShip.reputation,
          killed : this.uuid,
          gains : this.data.credits
        });
        } else {
          attacker.credits = attacker.credits + this.data.credits
          updates.push({
            uuid: attacker.uuid,
            credits: attacker.credits,
            reputation: attacker.reputation,
            killed : this.uuid,
            gains : this.data.credits
          });
        }
      }

      if(attacker.hardpoints[0].subtype === 'harvester' ){
        if(this.durability > 0){
          this.durability = this.durability - attacker.hardpoints[0].data.damage;
        };
        updates.push({
          uuid: this.uuid,
          durability: this.durability
        })
        if(this.durability <= 0){
          this.manager.ai.queenCheck(this.config.stats.durability, this.uuid);
        };   
      };
    }

    // broadcast
    if(updates.length) {
      this.game.emit('ship/data', updates);
    }
  }
};

Ship.prototype.shieldCheck = function(uuid) {
  var ship, ships, distance, end, start,
      manager = this.manager, a, t;
  if(manager) {
    ships = manager.ships;
    if(!this.squadron){return}

    for(var s in this.squadron) {
      ship = this.squadron[s];
      var a = /^(squad-shield)/,
          t = ship.chassis;

      if(a.test(t) && ship.master === uuid && !ship.disabled){
        return (ship.ai.shieldCheck())
      };
    }
  }
};

Ship.prototype.disable = function() {
  // disable
  this.disabled = true;

  // disengage ai
  this.ai && this.ai.disengage();

  this.respawn = this.game.clock.events.add(this.ai ? this.ai.settings.respawn : Ship.RESPAWN_TIME, this.enable, this)

  // blast close
  // this.blast();

  // broadcast
  this.game.emit('ship/disabled', {
    uuid: this.uuid
  });
  if(this.chassis === 'scavenger-x04' || this.chassis === 'scavenger-x03'){
    this.game.clock.events.add(12000, function(){
      this.game.emit('ship/remove', this)
    }, this)
  }
};

Ship.prototype.blast = function() {
  var ship, ships, distance, end, start,
      manager = this.manager;
  if(manager != undefined) {
    ships = manager.ships;

    for(var s in ships) {
      ship = ships[s];

      if(ship.game && !ship.disabled && ship != this) {
        ship.movement.destabalize(this);
      }
    }
  }
};

Ship.prototype.enable = function() {
  // re-enable
  this.disabled = false;

  // update health, energy, durability
  this.data.health = this.config.stats.health;
  this.data.energy = this.config.stats.energy;
  this.data.durability = this.config.stats.durability;
  this.alpha = 1.0;

  // reset
  this.movement.magnitude = 0;
  // this.movement.position.copyFrom(this.ai ? this.ai.getHomePosition() : this.manager.generateRandomPosition(1024));

  //remove from ai consumed list
  if(this.manager.ai.consumed[this.uuid]){
    this.manager.ai.consumed[this.uuid] = null;
  }

  // broadcast
  this.sockets.send('ship/enabled', {
    uuid: this.uuid,
    pos: {
      x: this.movement.position.x,
      y: this.movement.position.y
    }
  });
};



Ship.prototype.activate = function(name) {
  var game = this.game,
      sockets = this.sockets,
      enhancements = this.enhancements,
      active = enhancements.active,
      available = enhancements.available,
      enhancement = available[name],
      stats, active, update, cost;
  if(enhancement) {
    cost = this.energy + enhancement.cost;

    if(!enhancement.activated && cost >= 0) {
      enhancement.start();
      enhancement.once('deactivated', this.deactivate, this);
      enhancement.once('cooled', this.cooled, this);

      stats = enhancement.stats;
      for(var s in stats) {
        active[s][name] = enhancement;
      }

      update = { uuid: this.uuid };
      update.energy = this.energy = global.Math.max(0.0, cost);

      // queue
      game.emit('ship/data', [update]);

      // broadcast
      sockets.send('ship/enhancement/started', {
        uuid: this.uuid,
        enhancement: name,
        subtype: enhancement.subtype
      });
    }
  }
};

Ship.prototype.deactivate = function(enhancement) {
  var sockets = this.sockets,
      enhancements = this.enhancements,
      active = enhancements.active,
      stats = enhancement.stats;
  
  for(var s in stats) {
    delete active[s][enhancement.type];
  }

  sockets.send('ship/enhancement/stopped', {
    uuid: this.uuid,
    enhancement: enhancement.type
  });
};

Ship.prototype.cooled = function(enhancement) {
  // user broadcast
  if(this.user) {
    this.user.socket.emit('ship/enhancement/cooled', {
      uuid: this.uuid,
      enhancement: enhancement.type
    });
  }
};

Ship.prototype.destroy = function() {
  var enhancements = this.enhancements,
      available = enhancements.available;
  for(var e in available) {
    available[e].destroy();
  }
  this.ai && this.ai.destroy();

  this.sockets.send('ship/removed', {
    uuid: this.uuid
  });

  this.manager = this.game =
    this.data = this.user = this.sockets =
    this.config = this.timers =
    this.enhancements = this.hardpoints =
    this.data = undefined;
};

Object.defineProperty(Ship.prototype, 'credits', {
  get: function() {
    return this.data.credits;
  },

  set: function(value) {
    this.data.credits = value;
  }
});

Object.defineProperty(Ship.prototype, 'reputation', {
  get: function() {
    return this.data.reputation;
  },

  set: function(value) {
    this.data.reputation = value;
  }
});

Object.defineProperty(Ship.prototype, 'capacity', {
  get: function() {
    return this.data.capacity;
  },

  set: function(value) {
    this.data.capacity = value;
  }
});

Object.defineProperty(Ship.prototype, 'energy', {
  get: function() {
    return this.data.energy;
  },

  set: function(value) {
    this.data.energy = value;
  }
});

Object.defineProperty(Ship.prototype, 'durability', {
  get: function() {
    return this.data.durability;
  },

  set: function(value) {
    this.data.durability = value;
  }
});

Object.defineProperty(Ship.prototype, 'size', {
  get: function() {
    return this.data.size;
  },

  set: function(value) {
    this.data.size = value;
  }
});

Object.defineProperty(Ship.prototype, 'health', {
  get: function() {
    return this.data.health;
  },

  set: function(value) {
    this.data.health = value;
  }
});

Object.defineProperty(Ship.prototype, 'heal', {
  get: function() {
    var total = this.data.heal,
        heal = this.enhancements.active.heal;
    for(var h in heal) {
      total *= heal[h].stat('heal', 'value');
    }
    return total;
  }
});

Object.defineProperty(Ship.prototype, 'recharge', {
  get: function() {
    var total = this.data.recharge,
        recharge = this.enhancements.active.recharge;
    for(var r in recharge) {
      total *= recharge[r].stat('recharge', 'value');
    }
    return total;
  }
});

Object.defineProperty(Ship.prototype, 'friendlies', {
  get: function() {
    if(this.ai){
      return this.ai.friendlies;
    } else {return null}
  },

  set: function(value) {
    this.data.friendlies = value;
  }
});

Object.defineProperty(Ship.prototype, 'faction', {
  get: function() {
    if(this.ai){
      return this.ai.faction;
      debugger
    } else {return null}
  },

  set: function(value) {
    this.data.faction = value;
  }
});

Object.defineProperty(Ship.prototype, 'masterShip', {
  get: function() {
    if(this.ai && this.master){
      return this.master;
    } else {return null}
  },

  set: function(value) {
    this.data.masterShip = value;
  }
});

Object.defineProperty(Ship.prototype, 'armor', {
  get: function() {
    var total = this.data.armor,
        armor = this.enhancements.active.armor;
    for(var a in armor) {
      total *= armor[a].stat('armor', 'value');
    }
    return total;
  }
});

Object.defineProperty(Ship.prototype, 'critical', {
  get: function() {
    var total = this.data.critical,
        critical = this.enhancements.active.critical;
    for(var a in critical) {
      total *= critical[a].stat('critical', 'value');
    }
    return total;
  }
});

Object.defineProperty(Ship.prototype, 'rate', {
  get: function() {
    var total = this.data.rate,
        rate = this.enhancements.active.rate;
    for(var d in rate) {
      total *= rate[d].stat('rate', 'value');
    }
    return total;
  }
});

Object.defineProperty(Ship.prototype, 'evasion', {
  get: function() {
    var total = this.data.evasion,
        evasion = this.enhancements.active.evasion;
    for(var a in evasion) {
      total *= evasion[a].stat('evasion', 'value');
    }
    return total;
  }
});

Object.defineProperty(Ship.prototype, 'speed', {
  get: function() {
    var total = this.data.speed,
        speed = this.enhancements.active.speed;
    for(var a in speed) {
      total *= speed[a].stat('speed', 'value');
    }
    return total
  }
});

module.exports = Ship;
