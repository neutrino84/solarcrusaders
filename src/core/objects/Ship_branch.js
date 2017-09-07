
var async = require('async'),
    engine = require('engine'),
    client = require('client'),
    System = require('./System'),
    Hardpoint = require('./Hardpoint'),
    Enhancement = require('./Enhancement'),
    Movement = require('./Movement'),
    Utils = require('../../utils');

function Ship(manager, data) {
  this.manager = manager;
  this.game = manager.game;
  // this.stations = manager.stations;
  this.sockets = manager.sockets;
  this.model = manager.model;
  
  // console.log(data)

  this.data = new this.model.Ship(data);
  this.data.init();

  if(data.master){
    this.master = data.master
  }
  this.target = manager.ships[data.target];
  if(this.target){
    this.target.disabled = true;
  }

  //placeholders for upgrades
  this.newArmorValue;
  this.newSpeedValue;

  this.uuid = this.data.uuid;
  this.chassis = this.data.chassis;
  if(data.squadron){
    this.squadron = data.squadron;
  }
  this.config = client.ShipConfiguration[this.data.chassis];

  this.disabled = false;

  // create system
  this.movement = new Movement(this);

  // generate ai
  this.ai = manager.ai.create(data.ai, this);

  // create metadata
  this.systems = {};
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
  this.transferable = {
    hardpoints: {}
  };
};

Ship.prototype.constructor = Ship;

Ship.RESPAWN_TIME = 10000;

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
}

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

Ship.prototype.createSystems = function() {
  var enhancement,
      enhancements = this.config.enhancements,
      available = this.enhancements.available;
  for(var e in enhancements) {
    available[enhancements[e]] = new Enhancement(this, enhancements[e]);
  }
};

Ship.prototype.createHardpoints = function(hardpoints) {
  var hardpoint, type, subtype, stats,
      hardpoints = hardpoints || this.config.targeting.hardpoints;
  // create turrets
  for(var i=0; i<hardpoints.length; i++) {
    stats = hardpoints[i];

    if(stats.default && stats.default.subtype) {
      type = stats.default.type;
      subtype = stats.default.subtype;
    } else {
      type = 'pulse';
      subtype = 'basic';
    }
    
    // cache to local object
    this.hardpoints[i] = new Hardpoint(this, i, type, subtype);
    this.transferable.hardpoints[i] = this.hardpoints[i].toObject();
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

  if(!this.ai){
    // console.log('player attacked, player is ', this)
  }
  // validate attack
  for(var slot in hardpoints) {
    hardpoint = hardpoints[slot];

    if(!hardpoint.cooling && distance <= hardpoint.data.range) {
      // compute travel time
      runtime = distance * hardpoint.data.projection + hardpoint.data.delay;

      // time collisions
      game.clock.events.add(runtime, this.attacked, this, target, slot);

      // cooldown
      if(hardpoint.data.cooldown > 0) {
        hardpoint.cooldown(runtime-rtt);
      }
    }
  };

  // broadcast atack
  sockets.emit('ship/attack', data);
};

Ship.prototype.attacked = function(target, slot) {
  var ship, ships,
      stations = this.game.sectorManager.stationManager.stations;
      manager = this.manager;
  if(manager != undefined) {
    ships = manager.ships;
    // console.log('this.game is ', this.game)
    // stations = manager.stations;
    // console.log('stations are ', stations)
    // debugger
    for(var s in ships) {
      ship = ships[s];

      if(ship.game && ship != this) {
        ship.hit(this, target, slot);
      }
    };
    for(var st in stations){
      // console.log('station is ', stations[st])
        stations[st].hit(this, target, slot);
    }
  };
};

Ship.prototype.hit = function(attacker, target, slot) {
  var updates = [],
      sockets = this.sockets,
      movement = this.movement,
      data = this.data,
      ai = this.ai,
      hardpoint = attacker.hardpoints[slot],
      piercing = attacker.enhancements.active.piercing,
      compensated = movement.compensated(),
      distance = compensated.distance(target),
      ratio = distance / (this.size * hardpoint.data.aoe),
      damage, health, critical, durability, shielded, killpoints, master;

  if(ratio < 1.0) {
    // // test data
    // if(!attacker.ai && this.ai) {
    //   sockets.emit('ship/test', {
    //     uuid: this.uuid,
    //     compensated: compensated,
    //     targ: target
    //   });
    // }

    //prevent friendly fire dmg to squadron
    if(this.master === attacker.uuid){return}  

    // calc damage
    critical = this.game.rnd.rnd() <= attacker.critical;
    damage = global.Math.max(0, hardpoint.data.damage * (1-ratio) * (1-this.armor));
    damage += critical ? damage : 0;
    damage *= piercing ? piercing.damage : 1;

    if(this.squadron && this.shieldCheck(this.uuid)){
        damage = damage*0.7;
        shielded = true;
        //shielded = true --> tells front end to show the shield filter
    };

    if(attacker.hardpoints[0].subtype === 'repair_beam' && data.health < this.config.stats.health){
    health = data.health + damage;
    } else {
      health = data.health-damage;
    }
    durability = this.durability

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

          if(!attacker.ai || attacker.master){
            killpoints = this.config.stats.health;
            if(attacker.master){
              master = attacker.master
            }
          };

          attacker.reputation = global.Math.floor(attacker.reputation + (this.reputation * -0.05));
          attacker.credits = global.Math.floor(attacker.credits + this.credits);
          updates.push({
            uuid: attacker.uuid,
            reputation: attacker.reputation,
            killpoints: killpoints,
            credits : attacker.credits,
            master : master
          });
        }

        if(attacker.hardpoints[0].subtype === 'harvester' || attacker.hardpoints[0].subtype === 'harvester-advanced'){
          if(this.durability > 0){
            this.durability = this.durability - attacker.hardpoints[0].data.damage;
          };
          updates.push({
            uuid: this.uuid,
            durability: this.durability
          })
          if(this.durability <= 0){
            this.manager.ai.queenCheck(this.config.stats.durability, this.uuid)
          };   
        };
      };

   

    // broadcast
    if(updates.length) {
      sockets.emit('ship/data', {
        type: 'update', ships: updates
      });
    }
  }
};

Ship.prototype.disable = function() {

  // disable
  this.disabled = true;

  // disengage ai
  this.ai && this.ai.disengage();

  // respawn time
  this.respawn = this.game.clock.events.add(this.ai ? this.ai.settings.respawn : Ship.RESPAWN_TIME, this.enable, this);

  // blast close
  this.blast();

  // broadcast
  this.game.emit('ship/disabled', {
    uuid: this.uuid
  });

  if(this.chassis === 'squad-shield_2'){
    console.log('in backend Ship.js. telling shield ship to stop')
    this.ai.disengage();
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
        ship.movement.destabilize(this);
      }
    }
  }
};

Ship.prototype.shieldCheck = function(uuid) {
  var ship, ships, distance, end, start,
      manager = this.manager, a, t;
  if(manager != undefined) {
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

Ship.prototype.enable = function() {
  
  // re-enable
  this.disabled = false;

  // reset alpha/durability
  this.durability = this.config.stats.durability;
  this.alpha = 1.0;

  // activate ui ---  commenting out since Basic.reengage() currently doesn't do anything
  // this.ai && this.ai.reengage();


  // update health / energy
  this.data.health = this.config.stats.health;
  this.data.energy = this.config.stats.energy;

  // reset location
  this.movement.magnitude = 0;
  this.movement.position.copyFrom(this.ai ? this.ai.getHomePosition() : this.manager.generateRandomPosition(1024));

  //remove from ai consumed list
  if(this.manager.ai.consumed[this.uuid]){
    this.manager.ai.consumed[this.uuid] = null;
  }


  // broadcast
  this.sockets.emit('ship/enabled', {
    uuid: this.uuid,
    pos: {
      x: this.movement.position.x,
      y: this.movement.position.y
    }
  });
};

Ship.prototype.activate = function(name) {
  var sockets = this.sockets,
      enhancements = this.enhancements,
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

      sockets.emit('ship/data', {
        type: 'update', ships: [update]
      });

      sockets.emit('ship/enhancement/started', {
        uuid: this.uuid,
        enhancement: name,
        subtype: enhancement.subtype
      });
    }
  }
};

Ship.prototype.deactivate = function(enhancement) {
  var enhancements = this.enhancements,
      active = enhancements.active,
      stats = enhancement.stats;
  
  for(var s in stats) {
    delete active[s][enhancement.type];
  }

  this.sockets.emit('ship/enhancement/stopped', {
    uuid: this.uuid,
    enhancement: enhancement.type
  });
};

Ship.prototype.cooled = function(enhancement) {
  this.sockets.emit('ship/enhancement/cancelled', {
    uuid: this.uuid,
    enhancement: enhancement.type
  });
};

Ship.prototype.destroy = function() {
  // var enhancements = this.enhancements,
  //     available = enhancements.available;
  // for(var e in available) {
  //   available[e].destroy();
  // }
  // this.ai && this.ai.destroy();
  // this.respawn && this.game.clock.events.remove(this.respawn);
  // this.manager = this.game =
  //   this.data = this.user = this.sockets =
  //   this.config = this.systems = this.timers =
  //   this.enhancements = this.hardpoints =
  //   this.data = undefined;
};

Object.defineProperty(Ship.prototype, 'credits', {
  get: function() {
    return this.data.credits;
  },

  set: function(value) {
    this.data.credits = value;
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
      total += heal[h].stat('heal', 'value');
    }
    return total;
  }
});

Object.defineProperty(Ship.prototype, 'recharge', {
  get: function() {
    var total = this.data.recharge,
        recharge = this.enhancements.active.recharge;
    for(var r in recharge) {
      total += recharge[r].stat('recharge', 'value');
    }
    return total;
  }
});

Object.defineProperty(Ship.prototype, 'armor', {
  get: function() {
    var total = this.newArmorValue || this.data.armor;
        armor = this.enhancements.active.armor;

    for(var a in armor) {
      total += armor[a].stat('armor', 'value');
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
    var total = this.newSpeedValue || this.data.speed,
        speed = this.enhancements.active.speed;
    for(var a in speed) {
      total *= speed[a].stat('speed', 'value');
    }
    return total
  }
});

module.exports = Ship;