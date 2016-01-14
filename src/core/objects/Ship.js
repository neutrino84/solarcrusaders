
var engine = require('engine'),
    client = require('client'),
    Enhancement = require('./Enhancement'),
    Utils = require('../../utils');

function Ship(manager, ship) {
  this.manager = manager;
  this.game = manager.game;
  this.model = manager.model;
  this.sockets = manager.sockets;

  this.uuid = ship.uuid;
  this.user = ship.user;
  this.chasis = ship.chasis;
  this.config = client.ShipConfiguration[ship.chasis];

  this.throttle = global.parseFloat(ship.throttle);
  this.rotation = global.parseFloat(ship.rotation);
  this.position = new engine.Point(global.parseFloat(ship.x), global.parseFloat(ship.y));
  this.interpolate = this.position.copyFrom.bind(this.position);

  ship = Utils.extend(ship, this.config.stats, false);

  this._id = global.parseInt(ship.id, 10);
  this._sector = global.parseInt(ship.sector, 10);
  this._health = global.parseFloat(ship.health);
  this._heal = global.parseFloat(ship.heal);
  this._armor = global.parseFloat(ship.armor);
  this._accuracy = global.parseFloat(ship.accuracy);
  this._evasion = global.parseFloat(ship.evasion);
  this._reactor = global.parseFloat(ship.reactor);
  this._recharge = global.parseFloat(ship.recharge);
  this._durability = global.parseFloat(ship.durability);
  this._speed = global.parseFloat(ship.speed);

  this.types = ['reactor'];
  this.timers = [];
  this.rooms = [];
  this.hardpoints = [];
  this.systems = {};
  this.enhancements = {
    active: {
      reactor: {},
      recharge: {},
      heal: {},
      health: {},
      accuracy: {},
      evasion: {},
      armor: {},
      damage: {},
      range: {},
      speed: {}
    },
    available: {}
  };

  // create
  this.createRooms();
  this.createSystems();
  this.createHardpoints();

  this.movement = new client.Movement(this);
};

Ship.prototype.constructor = Ship;

Ship.prototype.createRooms = function() {
  var layer, objects, room, properties,
      layers = this.config.tilemap.layers;
  for(var l in layers) {
    layer = layers[l];

    if(layer.name === 'rooms' && layer.type === 'objectgroup') {
      objects = layer.objects;
      for(var o in objects) {
        room = objects[o];
        properties = room.properties;

        if(properties.system) {
          this.types.push(properties.system);
        }

        this.rooms.push(properties);
      }
    }
  }
};

Ship.prototype.createSystems = function() {
  // speed - engine
  // accuracy - targeting
  // evasion - pilot
  var system, type, enhancement,
      enhancements = this.enhancements,
      systems = this.systems,
      types = this.types;
  for(var t in types) {
    type = types[t];

    system = this.model.system.createDefaultData();
    system.type = type;
    system.ship = this._uid;

    // enhancements
    // todo: make persistent
    switch(type) {
      case 'reactor':
        enhancement = 'overload';
        break;
      case 'engine':
        enhancement = 'booster';
        break;
      case 'shield':
        enhancement = 'shield';
        break;
      default:
        enhancement = null;
        break;
    }

    if(enhancement) {
      enhancements.available[enhancement] = new Enhancement(this, enhancement);
    }

    systems[type] = system;
  }
};

Ship.prototype.createHardpoints = function() {
  var hardpoint,
      hardpoints = this.config.targeting.hardpoints,
      enhancements = this.enhancements;
  for(var t in hardpoints) {
    hardpoint = hardpoints[t];
    this.hardpoints.push({
      type: hardpoint.type,
      damage: 2
    });
  }

  // enhancements
  enhancements.available['piercing'] = new Enhancement(this, 'piercing');
};

Ship.prototype.activate = function(name) {
  var enhancements = this.enhancements,
      active = enhancements.active,
      available = enhancements.available,
      enhancement = available[name],
      stats, active, cooldown, update, cost;
  if(enhancement) {
    cost = this.reactor + enhancement.cost;
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
      update.reactor = this.reactor = global.Math.max(0.0, cost);

      switch(name) {
        case 'overload':
        case 'booster':
          this.movement.reset();
          if(this.movement.animation.isPlaying) {
            this.movement.update();
            this.movement.plot();
          }
          update.speed = this.speed;
          update.throttle = this.throttle;
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
  switch(enhancement.name) {
    case 'overload':
    case 'booster':
      this.movement.reset();
      if(this.movement.animation.isPlaying) {
        this.movement.update();
        this.movement.plot();
      }
      update = { uuid: this.uuid };
      update.speed = this.speed;
      update.throttle = this.throttle;
      this.sockets.io.sockets.emit('ship/data', {
        type: 'update', ships: [update]
      });
      break;
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
    this.model = this.movement = this.user =
    this.position = this.config = this.systems =
    this.enhancements = this.hardpoints = this.timers =
    this.rooms = this.model = undefined;
};

Object.defineProperty(Ship.prototype, 'reactor', {
  get: function() {
    return this._reactor;
  },

  set: function(value) {
    this._reactor = value;
  }
});

Object.defineProperty(Ship.prototype, 'durability', {
  get: function() {
    return this._durability;
  },

  set: function(value) {
    this._durability = value;
  }
});

Object.defineProperty(Ship.prototype, 'health', {
  get: function() {
    return this._health;
  },

  set: function(value) {
    this._health = value;
  }
});

Object.defineProperty(Ship.prototype, 'recharge', {
  get: function() {
    var recharge = this.enhancements.active.recharge,
        total = this._recharge;
    for(var r in recharge) {
      total += recharge[r].stat('recharge', 'value');
    }
    return total;
  }
});

Object.defineProperty(Ship.prototype, 'heal', {
  get: function() {
    var heal = this.enhancements.active.heal,
        total = this._heal;
    for(var h in heal) {
      total += heal[h].stat('heal', 'value');
    }
    return total;
  }
});

Object.defineProperty(Ship.prototype, 'armor', {
  get: function() {
    var armor = this.enhancements.active.armor,
        total = this._armor;
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
        damage = this.enhancements.active.damage;
    for(var t in hardpoints) {
      total += hardpoints[t].damage;
    }
    for(var d in damage) {
      total += damage[d].stat('damage', 'value');
    }
    return total;
  }
});

Object.defineProperty(Ship.prototype, 'range', {
  get: function() {
    return 384;
  }
});

Object.defineProperty(Ship.prototype, 'accuracy', {
  get: function() {
    var bonus = 0,
        accuracy = this.enhancements.active.accuracy,
        engine = this.systems['targeting'],
        modifier = engine ? engine.modifier : 1.0,
        health = engine ? engine.health / engine.stats.health :
          this.health / this.config.stats.health;
    for(var a in accuracy) {
      bonus += accuracy[a].stat('accuracy', 'value');
    }
    return this._accuracy * modifier * global.Math.max(health, 0.5) + bonus;
  }
});

Object.defineProperty(Ship.prototype, 'evasion', {
  get: function() {
    var bonus = 0,
        evasion = this.enhancements.active.evasion,
        pilot = this.systems['pilot'],
        modifier = pilot ? pilot.modifier : 1.0,
        health = pilot ? pilot.health / pilot.stats.health :
          this.health / this.config.stats.health;
    for(var e in evasion) {
      bonus += evasion[e].stat('evasion', 'value');
    }
    return this._evasion * modifier * global.Math.max(health, 0.2) + bonus;
  }
});

Object.defineProperty(Ship.prototype, 'speed', {
  get: function() {
    var bonus = 0,
        speed = this.enhancements.active.speed,
        engine = this.systems['engine'],
        modifier = engine ? engine.modifier : 1.0,
        health = engine ? engine.health / engine.stats.health : 1.0;
    for(var a in speed) {
      bonus += speed[a].stat('speed', 'value');
    }
    return this._speed * modifier * global.Math.max(health, 0.5) + bonus;
  }
});

module.exports = Ship;
