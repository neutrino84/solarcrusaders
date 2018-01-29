
var async = require('async'),
    engine = require('engine'),
    client = require('client'),
    Hardpoint = require('./Hardpoint'),
    Enhancement = require('./Enhancement'),
    Movement = require('./Movement'),
    Formation = require('./Formation'),
    Utils = require('../../utils');

function Ship(game, data) {
  this.game = game;
  this.sockets = game.sockets;
  this.model = game.model;

  this.uuid = null;
  this.chassis = null;
  this.race = null;

  // relationships
  this.ai = null;
  this.station = null;
  this.user = null;
  this.master = null;

  // variables
  this.disabled = false;
  this.events = [];
  this.targets = [];

  // data model
  this.data = new this.model.Ship(data);
  this.data.init();

  // ship movement helper
  this.movement = new Movement(this);

  // squadron formation helper
  this.formation = new Formation(this);

  // current ship
  // command directives
  this.commands = {
    focus: true,
    formation: true,
    supress: false,
    defend: false
  };

  // hardpoints
  // enhancements
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
  };

  // ship configuration
  this.config = client.ShipConfiguration[this.data.chassis];
  this.config.squadron = data.squadron || [];
};

Ship.prototype.constructor = Ship;

Ship.prototype.init = function(callback, context) {
  var self = this,
      game = this.game,
      data = this.data;
  if(data.isNewRecord()) {
    // data shortcuts
    this.uuid = data.uuid;
    this.chassis = data.chassis;
    this.race = data.race;

    this.createRelationships();
    this.createEnhancements();
    this.createHardpoints();

    // ai helper
    this.ai = this.game.ai.factory(this);

    // callback created
    callback.call(context, self);
  } else {
    async.series([
      data.reload.bind(data)
    ], function(err, results) {
      callback.call(context, self);
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
  var game = this.game,
      data = this.data;

  // relationships
  this.station = game.stations[data.station] || null;
  this.user = game.users[data.user] || null;
  this.master = game.ships[data.master] || null;

  // update user object
  if(this.user) {
    this.user.ship = this;
    this.user.data.ship = this.uuid;
  }

  // add to formation
  if(this.master) {
    this.master.formation.add(this);
  }
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

Ship.prototype.createSquadron = function() {
  var game = this.game,
      user = this.user,
      formation = this.formation,
      squadron = this.config.squadron,
      position = {};

  // add squadron
  for(var i=0; i<squadron.length; i++) {
    // starting position
    formation.position(i, position);

    // create ship
    game.emit('ship/create', {
      master: this.uuid,
      station: this.station.uuid,
      chassis: squadron[i],
      x: position.x,
      y: position.y,
      ai: 'squadron'
    });
  }
};

Ship.prototype.plot = function(coordinates, rtt) {
  var movement = this.movement,
      compensated = movement.compensated(rtt);

  // plot ship
  movement.plot({
    x: coordinates.x - compensated.x,
    y: coordinates.y - compensated.y });
};

Ship.prototype.attack = function(data, rtt) {
  if(this.disabled) { return; }

  var attacker = this,
      game = this.game,
      sockets = this.sockets,
      events = this.events,
      movement = this.movement,
      hardpoints = this.hardpoints,
      runtime, hardpoint, compensated,
      target = data.targ,
      distance, squad,
      rtt = rtt || 0;

  // get updated data
  compensated = movement.compensated(rtt);
  distance = compensated.distance(target);

  // clear events
  events.length = 0;

  // validate attack
  for(var slot in hardpoints) {
    hardpoint = hardpoints[slot];

    if(distance <= hardpoint.data.range) {
      // compute travel time
      runtime = distance * hardpoint.data.projection + hardpoint.data.delay;

      // time collisions
      events.push(game.clock.events.add(runtime-rtt, this.attacked, this, target, slot));
    }
  }

  // broadcast atack
  sockets.send('ship/attack', data);
};

Ship.prototype.attacked = function(target, slot) {
  var game = this.game,
      ships = game.ships, ship;

  // iterate
  for(var s in ships) {
    ship = ships[s];

    if(!ship.disabled && ship != this) {
      ship.hit(this, target, slot);
    }
  }

  // emit event
  game.emit('ship/attacked', this, target, slot);
};

Ship.prototype.hit = function(attacker, target, slot) {
  var updates = [],
      game = this.game,
      uuid = this.uuid,
      movement = this.movement,
      data = this.data,
      size = this.size,
      ai = this.ai,
      rnd = game.rnd,
      hardpoint = attacker.hardpoints[slot],
      position = movement.compensated(0),
      distance = position.distance(target),
      ratio = 1-(distance/(size+hardpoint.data.aoe)),
      damage, health, critical;

  // hit test
  if(ratio > 0.0) {
    // // test data
    // if(!attacker.ai && this.ai) {
    //   sockets.send('ship/test', {
    //     uuid: this.uuid,
    //     compensated: position,
    //     targ: target
    //   });
    // }

    // calculate damage
    critical = rnd.rnd() <= attacker.critical ? rnd.realInRange(2.0, 6.0) : 1.0;
    damage = hardpoint.data.damage * ratio * critical;
    health = data.health-damage > 0 ? data.health-damage : 0;

    // update health
    data.health = health;
    updates.push({
      uuid: uuid,
      attacker: attacker.uuid,
      health: data.health,
      damage: damage,
      critical: critical
    });

    // update attacker
    attacker.credits += damage;
    updates.push({
      uuid: attacker.uuid,
      credits: attacker.credits,
      hardpoint: {
        uuid: uuid,
        slot: hardpoint.slot,
        target: target,
        damage: damage
      }
    });

    // update damage
    if(health > 0) {
      // update targets in
      // the attacker ship
      if(attacker.targets.indexOf(this) < 0) {
        attacker.targets.unshift(this);
        attacker.targets = attacker.targets.slice(0, 3);
      }

      // notify ai of 
      // this attack
      ai && ai.attacked(attacker);
    } else {
      // disabled
      updates.push({
        uuid: uuid,
        disabled: true
      });

      // disable
      this.disable();
    }

    // broadcast
    game.emit('ship/data', updates);
  }
};

Ship.prototype.enable = function() {
  // re-enable
  this.disabled = false;

  // reset health, energy, durability
  this.data.health = this.config.stats.health;
  this.data.energy = this.config.stats.energy;

  // stop destruction timer
  this.destruction && this.game.clock.events.remove(this.destruction);

  // broadcast
  this.game.emit('ship/data', [{
    uuid: this.uuid,
    disabled: false
  }]);
};

Ship.prototype.disable = function() {
  // disable
  this.disabled = true;

  // stop movement
  this.movement.stop();

  // disband squadron
  this.formation.disband();

  // cleanup
  this.ai && this.ai.disengage();

  // remove from formation
  this.master && this.master.formation.remove(this);

  // destruction timer
  this.destruction && this.game.clock.events.remove(this.destruction);
  this.destruction = this.game.clock.events.add(this.game.rnd.integerInRange(8000, 16000), function() {
    this.game.emit('ship/remove', this);
  }, this);
};

Ship.prototype.command = function(data) {
  // set command option
  this.commands[data.action] = data.toggled;
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
  var squad, enhancement,
      game = this.game,
      enhancements = this.enhancements.available,
      events = this.events;
  
  // destroy enhancements
  for(var e in enhancements) {
    enhancements[e].destroy();
  }

  // destroy events
  for(var e in events) {
    game.clock.events.remove(events[e]);
  }
  
  // remove reference
  if(this.user != undefined) {
    this.user.ship = null;
    this.user.data.ship = null;
  }

  // destroy helpers
  this.formation.destroy();
  this.movement.destroy();
  this.ai.destroy();

  // notify sockets
  this.sockets.send('ship/remove', {
    uuid: this.uuid
  });

  // remove from world
  delete this.game.ships[this.uuid];

  // final cleanup
  this.game = this.data = this.user = this.master =
    this.sockets = this.config = this.movement =
    this.enhancements = this.hardpoints = undefined;
};

Object.defineProperty(Ship.prototype, 'integrity', {
  get: function() {
    return this.data.health/this.config.stats.health;
  }
});

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
