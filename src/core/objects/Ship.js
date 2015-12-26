
var engine = require('engine'),
    client = require('client'),
    Utils = require('../../utils');

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

  this.types = ['reactor'];
  this.rooms = [];
  this.turrets = [];
  this.systems = {};

  // create
  this.createRooms();
  this.createSystems();
  this.createTurrets();

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
  var system, type,
      types = this.types;
  for(var t in types) {
    type = types[t];

    system = this.model.system.createDefaultData();
    system.type = type;
    system.ship = this._uid;

    this.systems[type] = system;
  }
};

Ship.prototype.createTurrets = function() {
  var turret,
      turrets = this.config.targeting.turrets;
  for(var t in turrets) {
    turret = turrets[t];
    this.turrets.push({
      type: turret.type,
      damage: 2
    });
  }
};

Ship.prototype.destroy = function() {
  this.movement.destroy();

  this.manager = this.game =
    this.movement = this.user =
    this.position = this.config =
    this.systems = this.model = undefined;
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

Object.defineProperty(Ship.prototype, 'heal', {
  get: function() {
    return this._heal;
  }
});

Object.defineProperty(Ship.prototype, 'damage', {
  get: function() {
    return this._damage || (
      this._damage = (function(turrets) {
        var damage = 0;
        for(var t in turrets) {
          damage += turrets[t].damage;
        }
        return damage;
      })(this.turrets));
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
    return this._evasion * modifier * global.Math.max(health, 0.2);
  }
});

Object.defineProperty(Ship.prototype, 'speed', {
  get: function() {
    var engine = this.systems['engine'],
        modifier = engine ? engine.modifier : 1.0,
        health = engine ? engine.health / engine.stats.health : 1.0;
    return this._speed * modifier * global.Math.max(health, 0.5);
  }
});

module.exports = Ship;
