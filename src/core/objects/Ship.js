
var async = require('async'),
    engine = require('engine'),
    client = require('client'),
    System = require('./System'),
    Hardpoint = require('./Hardpoint'),
    Enhancement = require('./Enhancement'),
    Movement = require('./Movement'),
    AI = require('../AI'),
    Utils = require('../../utils');

function Ship(manager, data) {
  this.manager = manager;
  this.game = manager.game;
  this.sockets = manager.sockets;
  this.model = manager.model;
  
  this.data = new this.model.Ship(data);
  this.data.init();

  this.uuid = this.data.uuid;
  this.chassis = this.data.chassis;
  this.config = client.ShipConfiguration[this.data.chassis];

  this.disabled = false;
  this.ignoreEnhancements = false;

  this.movement = new Movement(this);
  this.ai = data.ai ? AI.create(data.ai, this) : null; // reformat this

  this.timers = [];
  this.cargo = {};
  this.hardpoints = {};
  this.systems = {};
  
  this.enhancements = {
    active: {
      energy: {},
      recharge: {},
      heal: {},
      health: {},
      evasion: {},
      armor: {},
      critical: {},
      rate: {},
      speed: {}
    },
    available: {}
  };
};

Ship.prototype.constructor = Ship;

Ship.prototype.init = function(callback) {
  var self = this;
  if(this.data.isNewRecord()) {
    this.createSystems();
    this.createHardpoints();
    callback();
  } else {
    async.series([
      // this.data.reload.bind(this.data),
      this.data.systems.bind(this.data),
      this.data.hardpoints.bind(this.data)
    ], function(err, results) {
      self.createSystems();
      self.createHardpoints();
      callback(err);
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
      }//,
      // function(next) {
      //   var system, type,
      //       systems = self.systems;
      //   for(var type in systems) {
      //     system = new self.model.System(systems[type]);
      //     system.fk_system_ship = self.data.id;
      //     system.save();
      //   }
      //   next();
      // }
    ], callback);
  } else {
    callback();
  }
};

/*
 * System Factory
 */
Ship.prototype.createSystems = function() {
  var system, type, enhancement,
      systems = this.systems,
      cargo = this.cargo;
  for(var type in systems) {
    system = new this.model.System(new System(type).toObject());
    enhancement = system.enhancement;
    if(enhancement) {
      this.enhancements.available[enhancement] = new Enhancement(this, enhancement);
    }
    systems[type] = system.toStreamObject();
    cargo[system.uuid] = {
      uuid: system.uuid,
      sprite: system.cargo,
      enabled: true,
      type: 'system'
    };
  }
};

/*
 * Hardpoint Factory
 */
Ship.prototype.createHardpoints = function() {
  var hardpoint, type, subtype, stats,
      hardpoints = this.config.targeting.hardpoints,
      length = hardpoints.length;

  // create turrets
  for(var i=0; i<length; i++) {
    stats = hardpoints[i];

    if(stats.default) {
      type = stats.default.type;
      subtype = stats.default.subtype;
    } else {
      type = 'pulse';
    }

    // else {  
    //   type = 'energy';
    //   subtype = 'basic';
    // }
    // if(hardpoints[i].type === 'sub') {
    //   type = 'rocket';
    //   subtype = 'basic';
    // }

    // hardpoint = new this.model.Hardpoint();
    // hardpoint.toStreamObject();
    
    // cache to local object
    this.hardpoints[i] = new Hardpoint(i, type, subtype).toObject(); 

    // add cargo item
    // this.cargo[hardpoint.uuid] = {
    //   uuid: hardpoint.uuid,
    //   sprite: hardpoint.cargo,
    //   enabled: true,
    //   type: 'hardpoint'
    // };
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

Ship.prototype.attacked = function(target, slot) {
  var ship,
      ships = this.manager.ships;
  if(this.game == undefined) { return; }
  for(var s in ships) {
    ship = ships[s];
    if(ship.game && ship != this) {
      ship.hit(this, target, slot);
    }
  }
};

Ship.prototype.hit = function(attacker, target, slot) {
  var updates = [],
      sockets = this.sockets,
      movement = this.movement,
      data = this.data,
      ai = this.ai,
      hardpoint = attacker.hardpoints[slot],
      compensated = movement.compensated(),
      distance = compensated.distance(target),
      ratio = distance / this.size,
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
        health: data.health
      });

      // update attacker
      attacker.credits = global.Math.floor(attacker.credits + damage + (ai && ai.type === 'pirate' ? damage : 0));
      updates.push({
        uuid: attacker.uuid,
        credits: attacker.credits,
        hardpoint: {
          slot: hardpoint.slot,
          ship: this.uuid,
          target: target
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

Ship.prototype.disable = function() {
  this.disabled = true;
  this.ai && this.ai.disengage();
  this.timer = this.game.clock.events.add(this.ai ? this.ai.respawnTime : 10000, this.enable, this);
  this.sockets.io.sockets.emit('ship/disabled', {
    uuid: this.uuid
  });
};

Ship.prototype.enable = function() {
  // re-enable
  this.disabled = false;

  // respawn
  this.movement.magnitude = 0;
  this.movement.position.copyFrom(this.ai ? this.ai.getHomePosition() : this.manager.generateRandomPosition(1024));

  // update health / energy
  this.data.health = this.config.stats.health;
  this.data.energy = this.config.stats.energy;

  // broadcast
  this.sockets.io.sockets.emit('ship/enabled', {
    uuid: this.uuid,
    pos: {
      x: this.movement.position.x,
      y: this.movement.position.y
    }
  });
};

Ship.prototype.activate = function(name) {
  var enhancements = this.enhancements,
      active = enhancements.active,
      available = enhancements.available,
      enhancement = available[name],
      stats, active, cooldown, update, cost;
  
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

      this.sockets.io.sockets.emit('ship/data', {
        type: 'update', ships: [update]
      });

      this.sockets.io.sockets.emit('ship/enhancement/started', {
        uuid: this.uuid,
        enhancement: name
      });

      return true;
    }
  }
  
  return false;
};

Ship.prototype.deactivate = function(enhancement) {
  var enhancements = this.enhancements,
      active = enhancements.active,
      stats = enhancement.stats;
  
  for(var s in stats) {
    delete active[s][enhancement.type];
  }

  this.sockets.io.sockets.emit('ship/enhancement/stopped', {
    uuid: this.uuid,
    enhancement: enhancement.type
  });
};

Ship.prototype.cooled = function(enhancement) {
  this.sockets.io.sockets.emit('ship/enhancement/cancelled', {
    uuid: this.uuid,
    enhancement: enhancement.type
  });
};

Ship.prototype.destroy = function() {
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
    var bonus = 0,
        heal = this.ignoreEnhancements ? [] : this.enhancements.active.heal,
        repair = this.systems['repair'],
        modifier = repair ? repair.modifier : 1.0;
    for(var h in heal) {
      bonus += heal[h].stat('heal', 'value');
    }
    return this.data.heal * modifier + bonus;
  }
});

Object.defineProperty(Ship.prototype, 'recharge', {
  get: function() {
    var bonus = 0,
        recharge = this.ignoreEnhancements ? [] : this.enhancements.active.recharge,
        reactor = this.systems['reactor'],
        modifier = reactor ? reactor.modifier : 1.0;
    for(var r in recharge) {
      bonus += recharge[r].stat('recharge', 'value');
    }
    return this.data.recharge * modifier + bonus;
  }
});

Object.defineProperty(Ship.prototype, 'armor', {
  get: function() {
    var bonus = 0,
        armor = this.ignoreEnhancements ? [] : this.enhancements.active.armor,
        shield = this.systems['shield'],
        modifier = shield ? shield.modifier : 1.0;
    for(var a in armor) {
      bonus += armor[a].stat('armor', 'value');
    }
    return this.data.armor * modifier + bonus;
  }
});

Object.defineProperty(Ship.prototype, 'critical', {
  get: function() {
    var total = this.data.critical,
        critical = this.ignoreEnhancements ? [] : this.enhancements.active.critical;
    for(var a in critical) {
      total += critical[a].stat('critical', 'value');
    }
    return total;
  }
});

Object.defineProperty(Ship.prototype, 'rate', {
  get: function() {
    var total = this.data.rate,
        rate = this.ignoreEnhancements ? [] : this.enhancements.active.rate;
    for(var d in rate) {
      total += rate[d].stat('rate', 'value');
    }
    return total;
  }
});

Object.defineProperty(Ship.prototype, 'evasion', {
  get: function() {
    var total = this.data.evasion,
        evasion = this.ignoreEnhancements ? [] : this.enhancements.active.evasion;
    for(var a in evasion) {
      total += evasion[a].stat('evasion', 'value');
    }
    return total;
  }
});

Object.defineProperty(Ship.prototype, 'speed', {
  get: function() {
    var bonus = 0,
        speed = this.ignoreEnhancements ? [] : this.enhancements.active.speed;
    for(var a in speed) {
      bonus += speed[a].stat('speed', 'value');
    }
    return this.data.speed + bonus;
  }
});

module.exports = Ship;
