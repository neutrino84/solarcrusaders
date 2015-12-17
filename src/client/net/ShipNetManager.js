
var engine = require('engine'),
    EventEmitter = require('eventemitter3'),
    ShipData = require('./ShipData');

function ShipNetManager(game) {
  this.game = game;
  this.socket = game.net.socket;

  this.ships = {};

  this.socket.on('ship/sync', this._sync.bind(this));
  this.socket.on('ship/data', this._data.bind(this));
  this.socket.on('ship/targeted', this._targeted.bind(this));
  this.socket.on('ship/attack', this._attack.bind(this));

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
    if(this.ships[ships[s].uuid] === undefined) {
      this.ships[ships[s].uuid] = new ShipData(ships[s]);
    } else {
      this.ships[ships[s].uuid].update(data);
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

ShipNetManager.prototype._targeted = function(data) {
  this.game.emit('ship/targeted', data);
};

ShipNetManager.prototype._attack = function(data) {
  this.game.emit('ship/attack', data);
};

module.exports = ShipNetManager;
