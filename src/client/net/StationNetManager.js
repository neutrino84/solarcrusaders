
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
};

StationNetManager.prototype.getStationData = function(uuid) {
  return this.stations[uuid];
};

StationNetManager.prototype._data = function(data) {
  var station,
      stations = data.stations;

     // console.log(data)
     // debugger
  if(this.game.cache.checkJSONKey('station-configuration')) {
    for(var s in stations) {
      station = stations[s];
      if(data.type === 'sync' && this.stations[station.uuid] === undefined) {
        this.stations[station.uuid] = new StationData(this.game, station);
      } else if(this.stations[station.uuid]) {
        console.log('in  NETmanager, data is ', data)
        this.stations[station.uuid].update(station);
      }
    }
  }
};

StationNetManager.prototype._sync = function(data) {
  var station,
      stations = data.stations,
      uuids = [];
      // console.log(stations[0])
      // debugger
  // detect new
  for(var s in stations) {
    station = stations[s];
    // console.log(station)
      if(station.chassis === 'scavenger-nest-x01'){
      console.log('station  ', station.x, station.y)
      }

    if(this.stations[station.uuid] === undefined) {
      uuids.push(station.uuid);
    } else {
      // console.log(station, station.period)

    }
  }

  // request new data
  if(uuids.length > 0) {
    this.socket.emit('station/data', {
      uuids: uuids
    });
  }
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
