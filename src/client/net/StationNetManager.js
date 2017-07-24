
var engine = require('engine'),
    StationData = require('./StationData');

function StationNetManager(game) {
  this.game = game;
  this.socket = game.net.socket;

  this.stations = {};
};

StationNetManager.prototype.constructor = StationNetManager;

StationNetManager.prototype.init = function() {
  this.socket.on('station/sync', this._sync.bind(this));
  this.socket.on('station/data', this._data.bind(this));
  this.socket.on('station/removed', this._removed.bind(this));
  this.socket.on('station/disabled', this._disabled.bind(this));
  this.socket.on('station/enabled', this._enabled.bind(this));
  this.game.on('station/position', this._position.bind(this));
};

StationNetManager.prototype.getStationData = function(uuid) {
  return this.stations[uuid];
};

StationNetManager.prototype._data = function(data) {
  var station,
      stations = data.stations;
      // console.log('data???', data.stations)
    if(data.stations.length){
     // console.log('what the hell DATA station data is ', data)
    }
     // debugger
  if(this.game.cache.checkJSONKey('station-configuration')) {;

    for(var s in stations) {
      station = stations[s];
      if(data.type === 'sync' && this.stations[station.uuid] === undefined) {
        this.stations[station.uuid] = new StationData(this.game, station);
        console.log('syncing')
      } else if(this.stations[station.uuid]) {
<<<<<<< HEAD
        // console.log('~~update~~, station is ', station)
        // console.log('~~update~~', this.stations[station.uuid].x, this.stations[station.uuid].y)
=======
        console.log('in  NETmanager, data is ', data)
>>>>>>> 50147832439f8f82455db0584f4bff74195d5c8d
        this.stations[station.uuid].update(station);
      }
    }
  }
};

StationNetManager.prototype._sync = function(data) {
  var station,
      stations = data.stations,
      uuids = [];
<<<<<<< HEAD
      // console.log('in sync, data is ', data)
=======
      // console.log(stations[0])
>>>>>>> 50147832439f8f82455db0584f4bff74195d5c8d
      // debugger
  // detect new
  for(var s in stations) {
    station = stations[s];
    // console.log('station is ', station)
      if(station.chassis === 'scavenger-nest-x01'){
      console.log('station  ', station.x, station.y)
      }

    if(this.stations[station.uuid] === undefined) {
      uuids.push(station.uuid);
<<<<<<< HEAD
      // console.log('pushing', uuids)
=======
    } else {
      // console.log(station, station.period)

>>>>>>> 50147832439f8f82455db0584f4bff74195d5c8d
    }
  }
  // console.log(data)
  // request new data
  if(uuids.length > 0) {
    // console.log('emitting data', uuids)
    this.socket.emit('station/data', {
      uuids: uuids
    });
  }
};

StationNetManager.prototype._position = function(data) {
  this.socket.emit('station/position', data);
};

StationNetManager.prototype._disabled = function(data) {
  this.game.emit('station/disabled', data);
};

StationNetManager.prototype._enabled = function(data) {
  this.game.emit('station/enabled', data);
};

StationNetManager.prototype._removed = function(data) {
  this.game.emit('station/removed', data);
};

module.exports = StationNetManager;
