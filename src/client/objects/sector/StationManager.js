
var engine = require('engine'),
    EventEmitter = require('eventemitter3'),
    Station = require('./Station');

function StationManager(game) {
  EventEmitter.call(this);

  // initialize
  this.game = game;
  this.net = game.net;
  this.socket = game.net.socket;
  this.shipNetManager = game.shipNetManager;

  this.stationGroup = new engine.Group(game);

  // stations
  this.stations = {};

  this.game.on('game/pause', this._pause, this);
  this.game.on('game/resume', this._resume, this);
}

StationManager.prototype = Object.create(EventEmitter.prototype);
StationManager.prototype.constructor = StationManager;

StationManager.prototype.create = function(data, details) {
  var game = this.game,
      station = new Station(this, details.chasis);

  station.uuid = data.uuid;
  station.user = details.user;
  
  station.details = details;
  station.position.set(data.current.x, data.current.y);
  station.rotation = data.rotation;
  station.movement.throttle = data.throttle;
  station.movement.trajectoryGraphics = this.trajectoryGraphics;

  station.boot();

  this.stationGroup.add(station);

  return station;
};

StationManager.prototype.remove = function(ship) {
  var game = this.game,
      camera = game.camera,
      s = this.stations[station.uuid];
  if(s !== undefined) {
    if(camera.target === s) {
      camera.unfollow();
    }
    delete this.stations[ship.uuid] && s.destroy();
  }
};

StationManager.prototype.removeAll = function() {
  var stations = this.stations;
  for(var s in stations) {
    this.remove(stations[s]);
  }
};

StationManager.prototype.destroy = function() {
  var game = this.game,
      socket = this.socket;

  game.removeListener('game/pause', this._reset);
  game.removeListener('game/resume', this._resume);

  this.game = this.socket = undefined;

  this.removeAll();
};

StationManager.prototype._resume = function() {};

StationManager.prototype._pause = function() {};

module.exports = StationManager;
