
var engine = require('engine'),
    ShipData = require('./ShipData');

function ShipNetManager(game) {
  this.game = game;
  this.socket = game.net.socket;

  this.ships = {};
};

ShipNetManager.prototype.constructor = ShipNetManager;

ShipNetManager.prototype.init = function() {
  this.socket.on('target/hostile', this._hostile.bind(this));
  this.socket.on('squad/shieldUp', this._shieldUp.bind(this));
  this.socket.on('ship/sync', this._sync.bind(this));
  this.socket.on('ship/data', this._data.bind(this));
  this.socket.on('ship/removed', this._removed.bind(this));
  this.socket.on('ship/disabled', this._disabled.bind(this));
  this.socket.on('ship/enabled', this._enabled.bind(this));
  this.socket.on('ship/hardpoint/cooled', this._cooled.bind(this));
  this.socket.on('ship/enhancement/started',this._started.bind(this));
  this.socket.on('ship/enhancement/stopped', this._stopped.bind(this));
  this.socket.on('ship/enhancement/cancelled', this._cancelled.bind(this));
  this.socket.on('global/sound/spawn', this._spawn.bind(this));
};

ShipNetManager.prototype.getShipData = function(uuid) {
  return this.ships[uuid];
};

ShipNetManager.prototype._data = function(data) {
  var ship,
      ships = data.ships;
  // console.log('in shipNetManager! data is ', data)
  if(this.game.cache.checkJSONKey('ship-configuration') &&
      this.game.cache.checkJSONKey('item-configuration')) {
    for(var s in ships) {
      ship = ships[s];
      if(data.type === 'sync' && this.ships[ship.uuid] === undefined) {
        this.ships[ship.uuid] = new ShipData(this.game, ship);
      } else if(this.ships[ship.uuid]) {
        this.ships[ship.uuid].update(ship);
      }
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

ShipNetManager.prototype._hostile = function(data) {
  this.game.emit('target/hostile', data);
};

ShipNetManager.prototype._shieldUp = function(data) {
  this.game.emit('squad/shieldUp', data);
};

ShipNetManager.prototype._spawn = function(data) {
  this.game.emit('global/sound/spawn', data);
};

ShipNetManager.prototype._removed = function(data) {
  this.game.emit('ship/removed', data);
};

ShipNetManager.prototype._disabled = function(data) {
  this.game.emit('ship/disabled', data);
};

ShipNetManager.prototype._enabled = function(data) {
  this.game.emit('ship/enabled', data);
};

ShipNetManager.prototype._cooled = function(data) {
  this.game.emit('ship/hardpoint/cooled', data);
};

ShipNetManager.prototype._started = function(data) {
  this.game.emit('ship/enhancement/started', data);
};

ShipNetManager.prototype._stopped = function(data) {
  this.game.emit('ship/enhancement/stopped', data);
};

ShipNetManager.prototype._cancelled = function(data) {
  this.game.emit('ship/enhancement/cancelled', data);
};

module.exports = ShipNetManager;
