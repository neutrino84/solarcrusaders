
var engine = require('engine'),
    UserData = require('./UserData'),
    ShipData = require('./ShipData'),
    StationData = require('./StationData');

function NetManager(game) {
  this.game = game;
  this.socket = game.net.socket;
  this.user = game.auth.user;
  this.syncronizing = false;

  // global data
  this.game.data = {
    users: {},
    ships: {},
    stations: {}
  };

  // sector
  this.socket.on('sector/sync', this._sync.bind(this));
  this.socket.on('sector/data', this._data.bind(this));

  // ship
  this.connect('ship/attack');
  this.connect('ship/removed');
  this.connect('ship/disabled');
  this.connect('ship/enabled');
  this.connect('ship/enhancement/started');
  this.connect('ship/enhancement/stopped');
  this.connect('ship/enhancement/cooled');
};

NetManager.prototype.constructor = NetManager;

NetManager.prototype.init = function() {

};

NetManager.prototype.connect = function(ns) {
  this.socket.on(ns, this._emit.bind(this, ns));
};

NetManager.prototype.getUserData = function(uuid) {
  return this.game.data.users[uuid];
};

NetManager.prototype.getShipData = function(uuid) {
  return this.game.data.ships[uuid];
};

NetManager.prototype.getStationData = function(uuid) {
  return this.game.data.stations[uuid];
};

NetManager.prototype._data = function(data) {
  var user, ship, station,
      users = data.users,
      ships = data.ships,
      stations = data.stations;

  if(this.game.cache.checkJSONKey('ship-configuration') &&
      this.game.cache.checkJSONKey('station-configuration') &&
      this.game.cache.checkJSONKey('item-configuration')) {

    // update users
    for(var u in users) {
      user = users[u];

      if(this.game.data.users[user.uuid] === undefined) {
        this.game.data.users[user.uuid] = new UserData(this.game, user);
      } else if(this.game.data.users[user.uuid]) {
        this.game.data.users[user.uuid].update(user);

        if(user.uuid === this.user.uuid) {
          for(var p in user) {
            this.user[p] = user[p];
          }
        }
      }
    }

    // update ships
    for(var s in ships) {
      ship = ships[s];

      if(data.type === 'sync' && this.game.data.ships[ship.uuid] === undefined) {
        this.syncronizing = false;
        this.game.data.ships[ship.uuid] = new ShipData(this.game, ship);
      } else if(this.game.data.ships[ship.uuid]) {
        this.game.data.ships[ship.uuid].update(ship);
      }
    }

    // update stations
    for(var s in stations) {
      station = stations[s];

      if(data.type === 'sync' && this.game.data.stations[station.uuid] === undefined) {
        this.syncronizing = false;
        this.game.data.stations[station.uuid] = new StationData(this.game, station);
      } else if(this.game.data.stations[station.uuid]) {
        this.game.data.stations[station.uuid].update(station);
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

  // detect ships
  for(var s in ships) {
    ship = ships[s];

    if(this.game.data.ships[ship.uuid] === undefined) {
      uuids.ships.push(ship.uuid);
    }
  }

  // detect stations
  for(var s in stations) {
    station = stations[s];

    if(this.game.data.stations[station.uuid] === undefined) {
      uuids.stations.push(station.uuid);
    }
  }

  // emit sync
  this.game.emit('sector/sync', data);

  // request new data
  if(!this.syncronizing && (uuids.ships.length > 0 || uuids.stations.length > 0)) {
    this.syncronizing = true;
    this.socket.emit('sector/data', uuids);
  }
};

NetManager.prototype._emit = function(ns, data) {
  this.game.emit(ns, data);
};

module.exports = NetManager;
