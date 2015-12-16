
var engine = require('engine'),
    client = require('client');

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

  this._id = global.parseInt(ship.id, 10);
  this._sector = global.parseInt(ship.sector, 10);
  this._health = global.parseFloat(ship.health);
  this._heal = global.parseFloat(ship.heal);
  this._accuracy = global.parseFloat(ship.accuracy);
  this._evasion = global.parseFloat(ship.evasion);
  this._reactor = global.parseFloat(ship.reactor);
  this._durability = global.parseFloat(ship.durability);

  // speed - engine
  // accuracy - targeting
  // evasion - pilot
  if(ship.systems === undefined) {
    var system, type,
        types = ['pilot', 'engine', 'targeting', 'reactor'];
    this.systems = {};
    for(var t in types) {
      type = types[t];
      system = this.model.system.createDefaultData();
      system.type = type;
      system.ship = ship.uid;
      this.systems[type] = system;
    }
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
    return this._accuracy;
  }
});


Object.defineProperty(Ship.prototype, 'evasion', {
  get: function() {
    return this._evasion;
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

module.exports = Ship;
