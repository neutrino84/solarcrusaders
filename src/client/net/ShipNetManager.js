
var engine = require('engine'),
    EventEmitter = require('eventemitter3');

function ShipNetManager(game) {
  this.game = game;
  this.socket = game.net.socket;

  this.ships = {};

  this.socket.on('ship/sync', this._sync.bind(this));
  this.socket.on('ship/data', this._data.bind(this));

  EventEmitter.call(this);
};

ShipNetManager.prototype = Object.create(EventEmitter.prototype);
ShipNetManager.prototype.constructor = ShipNetManager;

ShipNetManager.prototype.getShipDataByUuid = function(uuid) {
  return this.ships[uuid];
};

ShipNetManager.prototype._data = function(data) {
  var ships = data.ships;
  for(var s in ships) {
    this.ships[ships[s].uuid] = ships[s];
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

module.exports = ShipNetManager;
