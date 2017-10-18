
var engine = require('engine'),
    UserData = require('./UserData'),
    ShipData = require('./ShipData'),
    StationData = require('./StationData');

function NetManager(game) {
  this.game = game;
  this.socket = game.net.socket;

  this.users = {};
  this.ships = {};
  this.stations = {};
  this.syncronizing = false;

  // sector
  this.socket.on('sector/sync', this._sync.bind(this));
  this.socket.on('sector/data', this._data.bind(this));

  // ship
  this.connect('user/shipSelected');
  this.connect('ship/attack');
  this.connect('ship/removed');
  this.connect('ship/disabled');
  this.connect('ship/enabled');
  this.connect('ship/enhancement/started');
  this.connect('ship/enhancement/stopped');
  this.connect('ship/enhancement/cooled');
  this.connect('squad/shieldMaidenConnect');
  this.connect('squad/shieldUp');
  this.connect('global/sound/spawn');
};

NetManager.prototype.constructor = NetManager;

NetManager.prototype.init = function() {

};

NetManager.prototype.connect = function(ns) {
  this.socket.on(ns, this._emit.bind(this, ns));
};

NetManager.prototype.getUserData = function(uuid) {
  return this.users[uuid];
};

NetManager.prototype.getShipData = function(uuid) {
  return this.ships[uuid];
};

NetManager.prototype.getStationData = function(uuid) {
  return this.stations[uuid];
};

NetManager.prototype._started = function(data) {
  this.game.emit('ship/enhancement/started', data);
};

NetManager.prototype._stopped = function(data) {
  this.game.emit('ship/enhancement/stopped', data);
};

NetManager.prototype._data = function(data) {
  var user, ship, station,
      users = data.users,
      ships = data.ships,
      stations = data.stations;
  if(data.stations){
    console.log('in netManager _data, data.stations ', data.stations)
  }
  if(this.game.cache.checkJSONKey('ship-configuration') &&
      this.game.cache.checkJSONKey('station-configuration') &&
      this.game.cache.checkJSONKey('item-configuration')) {

    // update ships
    for(var u in users) {
      user = users[u];

      if(data.type === 'sync' && this.users[user.uuid] === undefined) {
        this.syncronizing = false;
        this.users[user.uuid] = new UserData(this.game, user);
      } else if(this.users[user.uuid]) {
        this.users[user.uuid].update(user);
      }
    }

    // update ships
    for(var s in ships) {
      ship = ships[s];

      if(data.type === 'sync' && this.ships[ship.uuid] === undefined) {
        this.syncronizing = false;
        this.ships[ship.uuid] = new ShipData(this.game, ship);
      } else if(this.ships[ship.uuid]) {
        this.ships[ship.uuid].update(ship);
      }
    }

    // update stations
    for(var s in stations) {
      station = stations[s];

      if(data.type === 'sync' && this.stations[station.uuid] === undefined) {
        this.syncronizing = false;
        this.stations[station.uuid] = new StationData(this.game, station);
      } else if(this.stations[station.uuid]) {
        this.stations[station.uuid].update(station);
      }
    }
  }
};

NetManager.prototype._sync = function(data) {
  var ship, user, station,
      users = data.users,
      ships = data.ships,
      stations = data.stations,
      uuids = {
        users: [],
        ships: [],
        stations: []
      };

  // detect users
  for(var u in users) {
    user = users[u];

    if(this.users[user.uuid] === undefined) {
      uuids.users.push(user.uuid);
    }
  }

  // detect ships
  for(var s in ships) {
    ship = ships[s];

    if(this.ships[ship.uuid] === undefined) {
      uuids.ships.push(ship.uuid);
    }
  }

  // detect stations
  for(var s in stations) {
    station = stations[s];

    if(this.stations[station.uuid] === undefined) {
      uuids.stations.push(station.uuid);
    }
  }

  // emit sync
  this.game.emit('sector/sync', data);

  // request new data
  if(!this.syncronizing && (uuids.users.length > 0 || uuids.ships.length > 0 || uuids.stations.length > 0)) {
    this.syncronizing = true;
    this.socket.emit('sector/data', uuids);
  }
};

NetManager.prototype._emit = function(ns, data) {
  this.game.emit(ns, data);
};

module.exports = NetManager;
