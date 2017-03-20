
var uuid = require('uuid'),
    engine = require('engine'),
    Station = require('./objects/Station');

function StationManager(game) {
  this.game = game;
  this.model = game.model;
  this.sockets = game.sockets;
  this.iorouter = game.sockets.iorouter;

  this.game.on('station/add', this.add, this);

  this.stations = {};
};

StationManager.prototype.constructor = StationManager;

StationManager.prototype.init = function() {
  // io router
  this.game.on('station/data', this.data.bind(this));

  // generate station
  this.generateStation();
};

StationManager.prototype.add = function(station) {
  if(this.stations[station.uuid] === undefined) {
    this.stations[station.uuid] = station;
  }
};

StationManager.prototype.create = function(data) {
  var self = this,
      station;
  station = new Station(this, data);
  station.init(function(err) {
    self.game.emit('station/add', station);
  });
};

StationManager.prototype.data = function(sock, args, next) {
  var station,
      uuid,
      uuids = args[1].uuids,
      user = sock.sock.handshake.session.user,
      stations = [];
  for(var u in uuids) {
    station = this.stations[uuids[u]];
    if(station) {
      stations.push({
        uuid: station.uuid,
        name: station.data.name,
        x: station.data.x,
        y: station.data.y,
        chassis: station.chassis,
        period: station.period,
        radius: station.radius,
        race: station.race,
        rotation: station.rotation,
        size: station.size,
        health: station.health,
        heal: station.heal,
        speed: station.speed
      });
    }
  }
  sock.emit('station/data', {
    type: 'sync', stations: stations
  });
};

StationManager.prototype.update = function() {
  var data, station, orbit, moving,
      sockets = this.sockets,
      stations = this.stations,
      synced = [];
  for(var s in stations) {
    station = stations[s];

    if(station) {
      // orbit = station.orbit;
      // orbit.update();
      data = {
        uuid: station.uuid,
        period: station.data.period
      };
    }

    synced.push(data);
  }
  sockets.emit('station/sync', {
    stations: synced
  });
};

StationManager.prototype.generateStation = function() {
  this.create({
    x: 2048,
    y: 2048,
    chassis: 'ubadian-station-x01'
  });
};

module.exports = StationManager;
