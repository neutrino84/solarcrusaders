
var engine = require('engine'),
    UserData = require('./UserData'),
    ShipData = require('./ShipData'),
    StationData = require('./StationData');

function NetManager(game) {
  this.game = game;
  this.socket = game.net.socket;
  this.auth = game.auth;

  // user cache
  this.game.users = {};

  // socket events
  this.socket.on('sector/data', this.data.bind(this));
  this.socket.on('sector/sync', this.syncronize.bind(this));

  // socket/game routes
  this.connect('ship/attack');
  this.connect('ship/remove');
  this.connect('ship/enhancement/started');
  this.connect('ship/enhancement/stopped');
  this.connect('ship/enhancement/cooled');
};

NetManager.prototype.constructor = NetManager;

NetManager.prototype.connect = function(ns) {
  var game = this.game,
      socket = this.socket,
      emit = function(data) {
        game.emit(ns, data);
      };
  socket.on(ns, emit);
};

NetManager.prototype.data = function(data) {
  var game = this.game,
      auth = this.auth,
      users = data.users,
      ships = data.ships,
      stations = data.stations,
      user, ship, station, exists;

  if(game.cache.checkJSONKey('station-configuration') &&
      game.cache.checkJSONKey('ship-configuration') &&
      game.cache.checkJSONKey('item-configuration')) {

    // update users
    for(var u in users) {
      //.. userdata not yet updated
    }

    // update ships
    for(var s in ships) {
      ship = ships[s];
      exists = game.ships[ship.uuid];

      if(!exists && data.type === 'sync') {
        game.emit('ship/create', new ShipData(game, ship));
      } else if(exists && data.type === 'update') {
        exists.data.update(ship);
      }
    }

    // update stations
    for(var s in stations) {
      station = stations[s];
      exists = game.stations[station.uuid];

      if(!exists && data.type === 'sync') {
        game.emit('station/create', new StationData(game, station));
      } else if(exists && data.type === 'update') {
        exists.data.update(station);
      }
    }
  }
};

NetManager.prototype.syncronize = function(data) {
  var game = this.game,
      socket = this.socket,
      ships = data.ships,
      stations = data.stations,
      ship, station,
      uuids = {
        ships: [],
        stations: []
      };

  // detect ships
  for(var s in ships) {
    ship = ships[s];

    if(!game.ships[ship.uuid]) {
      uuids.ships.push(ship.uuid);
    }
  }

  // detect stations
  for(var s in stations) {
    station = stations[s];

    if(!game.stations[station.uuid]) {
      uuids.stations.push(station.uuid);
    }
  }

  // request data
  if(uuids.ships.length > 0 || uuids.stations.length > 0) {
    socket.emit('sector/data', uuids);
  }

  // send sync updated
  game.emit('sector/sync', data);
};

module.exports = NetManager;
