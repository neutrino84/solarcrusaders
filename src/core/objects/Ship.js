
var async = require('async'),
    engine = require('engine'),
    client = require('client'),
    Enhancement = require('./Enhancement'),
    Utils = require('../../utils');

function Ship(manager, data) {
  this.manager = manager;
  this.game = manager.game;
  this.sockets = manager.sockets;
  this.model = manager.model;
  this.data = data;

  this.uuid = data.uuid;
  this.chassis = data.chassis;
  this.config = client.ShipConfiguration[data.chassis];

  this.ignoreEnhancements = false;

  this.throttle = global.parseFloat(data.throttle);
  this.rotation = global.parseFloat(data.rotation);
  this.position = new engine.Point(global.parseFloat(data.x), global.parseFloat(data.y));
  this.interpolate = this.position.copyFrom.bind(this.position);

  this.timers = [];
  this.rooms = [];
  this.hardpoints = [];
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
      async.series([
        // check for memory leak
        // function(callback) {
        //   self.data.systems(callback);
        // },
        // function(callback) {
        //   self.data.hardpoints(callback);
        // }
        // // user will already be known
        // self.data.user.bind(self.data), 
        self.data.systems.bind(self.data),
        self.data.hardpoints.bind(self.data)
      ], function(err, results) {
        self.createRooms();
        if(self.data.isNewRecord()) {
          self.createSystems();
          self.createHardpoints();
        } else {
          // load user, systems and hardpoints
        }
        callback(err);
      });
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

Ship.prototype.createUser = function() {
  // stub..
};

Ship.prototype.createSystems = function(data) {
  // if not data, create default
  var system, type, enhancement,
      enhancements = this.enhancements,
      systems = this.systems;
  for(var type in systems) {
    system = new this.model.System({ name: type, type: type });
    enhancement = system.enhancement;
    if(enhancement) {
      enhancements.available[enhancement] =
        new Enhancement(this, enhancement);
    }
    systems[type] = system.toStreamObject();
  }
};

Ship.prototype.createHardpoints = function(data) {
  // if not data, create default
  var hardpoint,
      hardpoints = this.config.targeting.hardpoints;
  for(var t in hardpoints) {
    hardpoint = new this.model.Hardpoint({
      type: hardpoints[t].type
    });
    this.hardpoints.push(hardpoint.toStreamObject());
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

      switch(name) {
        case 'overload':
        case 'booster':
          // this.movement.reset();
          // if(this.movement.animation.isPlaying) {
          //   this.movement.update();
          //   this.movement.plot();
          // }
          // update.speed = this.speed;
          // update.throttle = this.throttle;
          break;
      }

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
  // switch(enhancement.name) {
  //   case 'overload':
  //   case 'booster':
  //     this.movement.reset();
  //     if(this.movement.animation.isPlaying) {
  //       this.movement.update();
  //       this.movement.plot();
  //     }
  //     update = { uuid: this.uuid };
  //     update.speed = this.speed;
  //     update.throttle = this.throttle;
  //     this.sockets.io.sockets.emit('ship/data', {
  //       type: 'update', ships: [update]
  //     });
  //     break;
  // }
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

Object.defineProperty(Ship.prototype, 'recharge', {
  get: function() {
    var total = this.data.recharge,
        recharge = this.ignoreEnhancements ? [] : this.enhancements.active.recharge;
    for(var r in recharge) {
      total += recharge[r].stat('recharge', 'value');
    }
    return total;
  }
});

Object.defineProperty(Ship.prototype, 'heal', {
  get: function() {
    var total = this.data.heal,
        heal = this.ignoreEnhancements ? [] : this.enhancements.active.heal;
    for(var h in heal) {
      total += heal[h].stat('heal', 'value');
    }
    return total;
  }
});

Object.defineProperty(Ship.prototype, 'armor', {
  get: function() {
    var total = this.data.armor,
        armor = this.ignoreEnhancements ? [] : this.enhancements.active.armor;
    for(var a in armor) {
      total += armor[a].stat('armor', 'value');
    }
    return total;
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
    return 768;
  }
});

Object.defineProperty(Ship.prototype, 'accuracy', {
  get: function() {
    var bonus = 0,
        accuracy = this.ignoreEnhancements ? [] : this.enhancements.active.accuracy,
        targeting = this.systems['targeting'],
        modifier = targeting ? targeting.modifier : 1.0,
        health = targeting ? targeting.health / targeting.stats.health :
          this.health / this.config.stats.health;
    for(var a in accuracy) {
      bonus += accuracy[a].stat('accuracy', 'value');
    }
    return this.data.accuracy * modifier * global.Math.max(health, 0.5) + bonus;
  }
});

Object.defineProperty(Ship.prototype, 'evasion', {
  get: function() {
    var bonus = 0,
        evasion = this.ignoreEnhancements ? [] : this.enhancements.active.evasion,
        pilot = this.systems['pilot'],
        modifier = pilot ? pilot.modifier : 1.0,
        health = pilot ? pilot.health / pilot.stats.health :
          this.health / this.config.stats.health;
    for(var e in evasion) {
      bonus += evasion[e].stat('evasion', 'value');
    }
    return this.data.evasion * modifier * global.Math.max(health, 0.2) + bonus;
  }
});

Object.defineProperty(Ship.prototype, 'speed', {
  get: function() {
    return this.data.speed;
    // var bonus = 0,
    //     speed = this.ignoreEnhancements ? [] : this.enhancements.active.speed,
    //     engine = this.systems['engine'],
    //     modifier = engine ? engine.modifier : 1.0,
    //     health = engine ? engine.health / engine.stats.health : 1.0;
    // for(var a in speed) {
    //   bonus += speed[a].stat('speed', 'value');
    // }
    // return this.data.speed * modifier * global.Math.max(health, 0.5) + bonus;
  }
});

module.exports = Ship;
