
var async = require('async'),
    engine = require('engine'),
    client = require('client'),
    System = require('./System'),
    Hardpoint = require('./Hardpoint'),
    Enhancement = require('./Enhancement'),
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

  this.ignoreEnhancements = false;

  this.throttle = global.parseFloat(this.data.throttle);
  this.rotation = global.parseFloat(this.data.rotation);
  this.position = new engine.Point(global.parseFloat(this.data.x), global.parseFloat(this.data.y));
  this.interpolate = this.position.copyFrom.bind(this.position);

  this.ai = data.ai ? AI.create(data.ai, this) : null;

  this.timers = [];
  this.rooms = [];
  this.cargo = {};
  this.hardpoints = {};
  this.systems = {
    'reactor': null
  };
  
  this.enhancements = {
    active: {
      energy: {},
      recharge: {},
      heal: {},
      health: {},
      accuracy: {},
      evasion: {},
      armor: {},
      damage: {},
      critical: {},
      range: {},
      speed: {}
    },
    available: {}
  };

  this.movement = new client.Movement(this);
};

Ship.prototype.constructor = Ship;

Ship.prototype.init = function(callback) {
  var self = this;
  if(this.data.isNewRecord()) {
    this.createRooms();
    this.createSystems();
    this.createHardpoints();
    callback();
  } else {
    async.series([
      // this.data.reload.bind(this.data),
      this.data.systems.bind(this.data),
      this.data.hardpoints.bind(this.data)
    ], function(err, results) {
      self.createRooms();
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
        self.data.x = self.position.x;
        self.data.y = self.position.y;
        self.data.rotation = self.rotation;
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

Ship.prototype.createRooms = function() {
  var layer, objects, room, properties,
      layers = this.config.tilemap.layers,
      systems = this.systems;
  for(var l in layers) {
    layer = layers[l];
    if(layer.name === 'rooms' && layer.type === 'objectgroup') {
      objects = layer.objects;
      for(var o in objects) {
        room = objects[o];
        properties = room.properties;
        if(properties.system) {
          systems[properties.system] = null;
        }
        this.rooms.push(room);
      }
    }
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
  var hardpoint,
      hardpoints = this.config.targeting.hardpoints;
  for(var slot in hardpoints) {
    hardpoint = new this.model.Hardpoint(new Hardpoint(slot, 'laser').toObject());
    this.hardpoints[slot] = hardpoint.toStreamObject();
    this.cargo[hardpoint.uuid] = {
      uuid: hardpoint.uuid,
      sprite: hardpoint.cargo,
      enabled: true,
      type: 'hardpoint'
    };
  }
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
      if(name === 'booster' && !this.movement.animation.isPlaying) { return false; }
      if(name === 'piercing' && !this.manager.battles[this.uuid]) { return false; }
      
      enhancement.start();
      enhancement.once('deactivated', this.deactivate, this);

      stats = enhancement.stats;
      for(var s in stats) {
        active[s][name] = enhancement;
      }

      update = { uuid: this.uuid };
      update.energy = this.energy = global.Math.max(0.0, cost);

      this.sockets.io.sockets.emit('ship/data', {
        type: 'update', ships: [update]
      });

      this.sockets.io.sockets.emit('enhancement/started', {
        ship: this.uuid,
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
    delete active[s][enhancement.name];
  }
  this.sockets.io.sockets.emit('enhancement/stopped', {
    ship: this.uuid,
    enhancement: enhancement.name
  });
};

Ship.prototype.destroy = function() {
  var enhancements = this.enhancements,
      available = enhancements.available;
  for(var e in available) {
    available[e].destroy();
  }
  this.movement.destroy();
  this.manager = this.game = this.sockets =
    this.data = this.movement = this.user =
    this.position = this.config = this.systems =
    this.enhancements = this.hardpoints = this.timers =
    this.rooms = this.data = undefined;
};

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
        modifier = repair ? ((repair.health / repair.stats.health) * (repair.modifier - 0.5)) : 1.0;
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
        modifier = reactor ? ((reactor.health / reactor.stats.health) * (reactor.modifier - 0.5)) : 1.0;
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
        modifier = shield ? ((shield.health / shield.stats.health) * (shield.modifier - 0.5)) + 0.5 : 1.0;
    for(var a in armor) {
      bonus += armor[a].stat('armor', 'value');
    }
    return this.data.armor * modifier + bonus;
  }
});

Object.defineProperty(Ship.prototype, 'damage', {
  get: function() {
    var total = 0,
        hardpoints = this.hardpoints,
        damage = this.ignoreEnhancements ? [] : this.enhancements.active.damage;
    for(var t in hardpoints) {
      total += hardpoints[t].damage;
    }
    for(var d in damage) {
      total += damage[d].stat('damage', 'value');
    }
    return total;
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

Object.defineProperty(Ship.prototype, 'range', {
  get: function() {
    var bonus = 0,
        range = this.ignoreEnhancements ? [] : this.enhancements.active.range,
        scanner = this.systems['scanner'],
        modifier = scanner ? ((scanner.health / scanner.stats.health) * (scanner.modifier - 0.5)) + 0.5 : 1.0;
    for(var r in range) {
      bonus += range[r].stat('range', 'value');
    }
    return this.data.range * modifier + bonus;
  }
});

Object.defineProperty(Ship.prototype, 'accuracy', {
  get: function() {
    var bonus = 0,
        accuracy = this.ignoreEnhancements ? [] : this.enhancements.active.accuracy,
        targeting = this.systems['targeting'],
        modifier = ((targeting.health / targeting.stats.health) * (targeting.modifier - 0.5)) + 0.5;
    for(var a in accuracy) {
      bonus += accuracy[a].stat('accuracy', 'value');
    }
    return this.data.accuracy * modifier + bonus;
  }
});

Object.defineProperty(Ship.prototype, 'evasion', {
  get: function() {
    var bonus = 0,
        evasion = this.ignoreEnhancements ? [] : this.enhancements.active.evasion,
        pilot = this.systems['pilot'],
        modifier = ((pilot.health / pilot.stats.health) * (pilot.modifier - 0.5)) + 0.5;
    for(var e in evasion) {
      bonus += evasion[e].stat('evasion', 'value');
    }
    return this.data.evasion * modifier + bonus;
  }
});

Object.defineProperty(Ship.prototype, 'speed', {
  get: function() {
    return this.data.speed;
    // var bonus = 0,
    //     speed = this.ignoreEnhancements ? [] : this.enhancements.active.speed,
    //     engine = this.systems['engine'],
    //     modifier = ((engine.health / engine.stats.health) * (engine.modifier - 0.5)) + 0.5;
    // for(var a in speed) {
    //   bonus += speed[a].stat('speed', 'value');
    // }
    // return this.data.speed * modifier + bonus;
  }
});

module.exports = Ship;
