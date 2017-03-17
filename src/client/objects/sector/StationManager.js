
var engine = require('engine'),
    Station = require('./Station');

function StationManager(game) {
  this.game = game;
  this.socket = game.net.socket;
  this.stationNetManager = game.states.current.stationNetManager;
  this.stationsGroup = new engine.Group(game);

  this.game.world.foreground.add(this.stationsGroup);

  this.game.once('ship/player', this.start, this);
  this.game.on('station/create', this.create, this);

  // can add
  this.ready = false;

  // stations
  this.stations = {};
}

StationManager.prototype.constructor = StationManager;

StationManager.prototype.start = function() {
  var stations = this.stations;
  for(var s in stations) {
    this.stationsGroup.add(stations[s]);
  }
  this.ready = true;
};

StationManager.prototype.create = function(data) {
  var game = this.game,
      station = new Station(this, data);
      station.boot();

  // add to group
  this.stations[station.uuid] = station;

  // wait
  if(this.ready) {
    this.stationsGroup.add(this.stations[station.uuid]);
  }
};

StationManager.prototype.sync = function(data) {
  var station, cached,
      game = this.game,
      stations = data.stations;
  for(var s=0; s<stations.length; s++) {
    station = this.stations[stations[s].uuid];
    
    if(station) {
      // sync station
    }
  }
};

StationManager.prototype.remove = function(station) {
  //..
};

StationManager.prototype.destroy = function() {

};

module.exports = StationManager;
