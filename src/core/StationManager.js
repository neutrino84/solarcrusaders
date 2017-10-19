
var uuid = require('uuid'),
    engine = require('engine'),
    Station = require('./objects/Station');

function StationManager(game) {
  this.game = game;
  this.model = game.model;
  this.sockets = game.sockets;

  this.stations = {};
};

StationManager.prototype.constructor = StationManager;

StationManager.prototype.init = function() {
  // listen to messaging
  this.game.on('station/add', this.add, this);
  this.game.on('station/create', this.create, this);
  this.game.on('station/disabled', this.disabled, this);
};

StationManager.prototype.add = function(station) {
  if(this.stations[station.uuid] === undefined) {
    this.stations[station.uuid] = station;
  }
};

StationManager.prototype.create = function(data) {
  var station = new Station(this, data);
      station.init(function(err) {
        this.game.emit('station/add', station);
      }, this);
};

StationManager.prototype.data = function(uuids) {
  var station,
      stations = [];
  for(var u in uuids) {
    station = this.stations[uuids[u]];
    if(station) {
      stations.push({
        uuid: station.uuid,
        name: station.data.name,
        x: station.orbit.position.x,
        y: station.orbit.position.y,
        throttle: station.orbit.throttle,
        rotation: station.orbit.rotation,
        spin: station.orbit.spin,
        period: station.orbit.period,
        speed: station.speed * station.orbit.throttle,
        radius: station.radius,
        chassis: station.chassis,
        race: station.race,
        size: station.size,
        health: station.health,
        heal: station.heal
      });
    }
    // console.log(station)
  }
  this.sockets.emit('station/data', {
    type: 'sync', stations: stations
  });
  return stations;
};

StationManager.prototype.sync = function(chassis) {
  var data, station, orbit,
      stations = this.stations,
      synced = [];
  for(var s in stations) {
    station = stations[s];

    if(station) {
      orbit = station.orbit;
      orbit.update();
      position = orbit.position;
      data = {
        uuid: station.uuid,
        pos: { x: position.x, y: position.y },
        spd: station.speed * orbit.throttle,
        rot: orbit.rotation,
        spn: orbit.spin
      };
      
    }

    synced.push(data);
  }
  return synced;
};

StationManager.prototype.getPosition = function(){
  var stations = this.stations, station, orbit, adjustedPosition;
  for(var s in this.stations){
    station = stations[s];
    if(station && station.chassis == 'ubadian-station-x01'){
      position = station.orbit.position;
      adjustedPosition = new engine.Point(position.x, position.y);
      adjustedPosition.x = adjustedPosition.x * 4;
      adjustedPosition.y = adjustedPosition.y * 4;
      return adjustedPosition
    }
  }
};

StationManager.prototype.disabled = function(data) {
  this.sockets.send('station/disabled', data);
};

module.exports = StationManager;
