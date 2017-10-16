
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

  // ship configuration
  this.config = client.ShipConfiguration[this.data.chassis];

  // disabled state
  this.disabled = false;

  // movement
  this.movement = new Movement(this);

  // generate ai
  this.ai = manager.ai.create(data.ai, this);

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
      game.clock.events.add(runtime, this.attacked, this, target, slot);
    }
  }

  // broadcast atack
  sockets.send('ship/attack', data);
};

Ship.prototype.attacked = function(target, slot) {
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

Ship.prototype.hit = function(attacker, target, slot) {
  var updates = [],
      sockets = this.sockets,
      movement = this.movement,
      data = this.data,
      ai = this.ai,
      durability = this.durability,
      hardpoint = attacker.hardpoints[slot],
      compensated = movement.compensated(),
      distance = compensated.distance(target),
      ratio = distance / (this.size * hardpoint.data.aoe),
      damage, health, critical;
  if(ratio < 1.0) {
    // // test data
    // if(!attacker.ai && this.ai) {
    //   sockets.send('ship/test', {
    //     uuid: this.uuid,
    //     compensated: compensated,
    //     targ: target
    //   });
    // }

    // calc damage
    critical = this.game.rnd.rnd() <= attacker.critical;
    damage = global.Math.max(0, hardpoint.data.damage * (1-ratio) * (1-this.armor));
    damage += critical ? damage : 0;
    health = data.health-damage;

    // update damage
    if(!this.disabled && health > 0) {
      // update health
      data.health = health;
      updates.push({
        uuid: this.uuid,
        attacker: attacker.uuid,
        health: data.health,
        damage: damage,
        critical: critical
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
      this.game.emit('ship/data', updates);
    }
  }
};

Ship.prototype.disable = function() {
  // disable
  this.disabled = true;

  // disengage ai
  this.ai && this.ai.disengage();
  
  // respawn time
  // if(!this.ai) {
  //   this.respawn = this.game.clock.events.add(Ship.RESPAWN_TIME, this.enable, this);
  // }

  // blast close
  // this.blast();

  // broadcast
  this.game.emit('ship/disabled', {
    uuid: this.uuid,
    ai: {
      type: this.ai ? this.ai.type : null
    }
  });
};

// Ship.prototype.blast = function() {
//   var ship, ships, distance, end, start,
//       manager = this.manager;
//   if(manager != undefined) {
//     ships = manager.ships;

//     for(var s in ships) {
//       ship = ships[s];

//       if(ship.game && !ship.disabled && ship != this) {
//         ship.movement.destabalize(this);
//       }
//     }
//   }
// };

Ship.prototype.enable = function() {
  // re-enable
  this.disabled = false;

  // update health, energy, durability
  this.data.health = this.config.stats.health;
  this.data.energy = this.config.stats.energy;
  this.data.durability = this.config.stats.durability;

  // reset
  this.movement.magnitude = 0;
  this.movement.position.copyFrom(this.ai ? this.ai.getHomePosition() : this.manager.generateRandomPosition(1024));

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
