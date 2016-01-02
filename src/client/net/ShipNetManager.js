
var engine = require('engine'),
    ShipData = require('./ShipData');

function ShipNetManager(game) {
  this.game = game;
  this.socket = game.net.socket;

  this.ships = {};
  this.battles = {};

  this.socket.on('ship/sync', this._sync.bind(this));
  this.socket.on('ship/data', this._data.bind(this));
  this.socket.on('ship/targeted', this._targeted.bind(this));
  this.socket.on('ship/attack', this._attack.bind(this));
  this.socket.on('ship/destroyed', this._destroyed.bind(this));
  this.socket.on('ship/plotted', this._plotted.bind(this));
  this.socket.on('enhancement/started', this._enstarted.bind(this));
  this.socket.on('enhancement/stopped', this._enstopped.bind(this));
  this.socket.on('enhancement/cancelled', this._ecancelled.bind(this));
};

ShipNetManager.prototype.constructor = ShipNetManager;

ShipNetManager.prototype.getShipDataByUuid = function(uuid) {
  return this.ships[uuid];
};

ShipNetManager.prototype.getBattleByOriginUuid = function(uuid) {
  return this.battles[uuid];
};

ShipNetManager.prototype._data = function(data) {
  var ship,
      ships = data.ships;
  for(var s in ships) {
    ship = ships[s];
    if(data.type === 'sync' && this.ships[ship.uuid] === undefined) {
      this.ships[ship.uuid] = new ShipData(this.game, ship);
    } else if(this.ships[ship.uuid]) {
      this.ships[ship.uuid].update(ship);
    }
  }
};

ShipNetManager.prototype._sync = function(data) {
  var ship,
      ships = data.ships,
      uuids = [];

  // detect new ships
  for(var s in ships) {
    ship = ships[s];
    if(this.ships[ship.uuid] === undefined) {
      uuids.push(ship.uuid);
    }
  }

  // request new data
  if(uuids.length > 0) {
    this.socket.emit('ship/data', {
      uuids: uuids
    });
  }
};

ShipNetManager.prototype._plotted = function(data) {

};

ShipNetManager.prototype._attack = function(data) {
  this.game.emit('ship/attack', data);
  this.battles[data.origin] = data;
};

ShipNetManager.prototype._targeted = function(data) {
  this.game.emit('ship/targeted', data);
  this.battles[data.origin] = data;
};

// ShipNetManager.prototype._untargeted = function(data) {
//   this.game.emit('ship/untargeted', data);
//   delete this.battles[ship.origin];
// };

ShipNetManager.prototype._enstarted = function(data) {
  this.game.emit('enhancement/started', data);
};

ShipNetManager.prototype._enstopped = function(data) {
  this.game.emit('enhancement/stopped', data);
};

ShipNetManager.prototype._ecancelled = function(data) {
  this.game.emit('enhancement/cancelled', data);
};

ShipNetManager.prototype._destroyed = function(data) {
  this.game.emit('ship/destroyed', data);
  delete this.battles[data.uuid];
};

module.exports = ShipNetManager;
