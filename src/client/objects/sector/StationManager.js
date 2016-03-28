
var engine = require('engine'),
    EventEmitter = require('eventemitter3'),
    Station = require('./Station'),
    FogFilter = require('../../fx/filters/FogFilter');

function StationManager(game) {
  EventEmitter.call(this);

  // initialize
  this.game = game;
  this.net = game.net;
  this.socket = game.net.socket;

  this.stationsGroup = new engine.Group(game);

  this.game.world.foreground.add(this.stationsGroup);

  // stations
  this.stations = {};

  this.game.on('game/pause', this._pause, this);
  this.game.on('game/resume', this._resume, this);
}

StationManager.prototype = Object.create(EventEmitter.prototype);
StationManager.prototype.constructor = StationManager;

StationManager.prototype.boot = function() {
  // this.fogFilter = new FogFilter(this.game);
  // this.stationsGroup.filters = [this.fogFilter];

  for(var i=0; i<1; i++) {
    this.create({
      uuid: i.toString(),
      center: { x: 2048, y: 2048 },
      index: i,
      orbit: 768,
      chassis: 'station'
    });
  }
};

StationManager.prototype.create = function(data) {
  var game = this.game,
      station = new Station(this, data);
      station.boot();

  this.stationsGroup.add(station);

  return station;
};

StationManager.prototype.remove = function(ship) {
  //..
};

StationManager.prototype.destroy = function() {
  var game = this.game,
      socket = this.socket;

  game.removeListener('game/pause', this._reset);
  game.removeListener('game/resume', this._resume);

  this.game = this.net = this.socket = undefined;
};

StationManager.prototype._resume = function() {};

StationManager.prototype._pause = function() {};

module.exports = StationManager;
