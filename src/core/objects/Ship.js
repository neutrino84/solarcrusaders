
var engine = require('engine'),
    client = require('client'),
    Utils = require('../../Utils');

function Ship(manager, ship) {
  this.manager = manager;
  this.game = manager.game;
  this.model = this.game.model;

  this.uuid = ship.uuid;
  this.user = ship.user;
  this.chasis = ship.chasis;
  this.config = engine.ShipConfiguration[ship.chasis];

  this.throttle = global.parseFloat(ship.throttle);
  this.rotation = global.parseFloat(ship.rotation);
  this.position = new engine.Point(global.parseFloat(ship.x), global.parseFloat(ship.y));
  this.movement = new client.Movement(this);

  ship = Utils.extend(ship, this.config.stats, false);

  this._id = global.parseInt(ship.id, 10);
  this._sector = global.parseInt(ship.sector, 10);
  this._health = global.parseFloat(ship.health);
  this._heal = global.parseFloat(ship.heal);
  this._accuracy = global.parseFloat(ship.accuracy);
  this._evasion = global.parseFloat(ship.evasion);
  this._reactor = global.parseFloat(ship.reactor);
  this._durability = global.parseFloat(ship.durability);
  this._speed = global.parseFloat(ship.speed);

  // this will probably replace
  // above system creation...
  // get data from ship layout
  var layer, objects, room, types = ['reactor'],
      layers = this.config.tilemap.layers;
  this.rooms = [];
  for(var l in layers) {
    layer = layers[l];
    if(layer.name === 'rooms' && layer.type === 'objectgroup') {
      objects = layer.objects;
      for(var o in objects) {
        room = objects[o];
        this.rooms.push(room.properties);
        room.properties.system && types.push(room.properties.system);
      }
    }
  }

  // speed - engine
  // accuracy - targeting
  // evasion - pilot
  var system, type;
  this.systems = {};
  for(var t in types) {
    type = types[t];
    system = this.model.system.createDefaultData();
    system.type = type;
    system.ship = ship.uid;
    this.systems[type] = system;
  }

  // default weapons
  if(ship.turrets === undefined) {
    this.turrets = {};
  }
};

Ship.prototype.constructor = Ship;

Ship.prototype.destroy = function() {
  this.movement.destroy();

  this.game = undefined;
  this.user = undefined;
  this.movement = undefined;
  this.position = undefined;
  this.config = undefined;
  this.systems = undefined;
  this.model = undefined;
};

Object.defineProperty(Ship.prototype, 'health', {
  get: function() {
    return this._health;
  },

  set: function(value) {
    this._health = value;
  }
});

Object.defineProperty(Ship.prototype, 'heal', {
  get: function() {
    return this._heal;
  }
});

Object.defineProperty(Ship.prototype, 'accuracy', {
  get: function() {
    var engine = this.systems['targeting'],
        modifier = engine ? engine.modifier : 1.0,
        health = engine ? engine.health / engine.stats.health :
          this.health / this.config.stats.health;
    return this._accuracy * modifier * global.Math.max(health, 0.5);
  }
});

Object.defineProperty(Ship.prototype, 'evasion', {
  get: function() {
    var pilot = this.systems['pilot'],
        modifier = pilot ? pilot.modifier : 1.0,
        health = pilot ? pilot.health / pilot.stats.health :
          this.health / this.config.stats.health;
    return this._evasion * modifier * global.Math.max(health, 0.5);
  }
});

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

Object.defineProperty(Ship.prototype, 'speed', {
  get: function() {
    var engine = this.systems['engine'],
        modifier = engine ? engine.modifier : 1.0;
    return this._speed;
  },

  set: function(value) {
    this._speed = value;
  }
});

module.exports = Ship;
