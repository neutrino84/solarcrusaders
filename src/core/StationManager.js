
var uuid = require('uuid'),
    engine = require('engine'),
    Station = require('./objects/Station');

function StationManager(game) {
  this.game = game;
  this.model = game.model;

  // global stations
  this.game.stations = {};
};

StationManager.prototype.constructor = StationManager;

StationManager.prototype.init = function() {
  
  // listen to messaging
  this.game.on('station/add', this.add, this);
  this.game.on('station/create', this.create, this);
  this.game.on('ship/attacked', this.attacked, this);
};

StationManager.prototype.add = function(station) {
  if(this.game.stations[station.uuid] === undefined) {
    this.game.stations[station.uuid] = station;
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
    station = this.game.stations[uuids[u]];
    if(station) {
      stations.push({
        uuid: station.uuid,
        name: station.data.name,
        x: station.movement.position.x,
        y: station.movement.position.y,
        throttle: station.movement.throttle,
        rotation: station.movement.rotation,
        spin: station.movement.spin,
        period: station.movement.period,
        speed: station.speed * station.movement.throttle,
        radius: station.radius,
        chassis: station.chassis,
        race: station.race,
        size: station.size,
        health: station.health,
        heal: station.heal,
        armor: station.armor
      });
    }
  }
  return stations;
};

StationManager.prototype.sync = function() {
  var data, station, movement,
      stations = this.game.stations,
      synced = [];
  for(var s in stations) {
    station = stations[s];

    if(station) {
      movement = station.movement;
      movement.update();
      position = movement.position;
      data = {
        uuid: station.uuid,
        pos: { x: position.x, y: position.y },
        spd: station.speed * movement.throttle,
        rot: movement.rotation,
        spn: movement.spin
      };
    }

    synced.push(data);
  }
  return synced;
};

StationManager.prototype.getPosition = function(chassis) {
  var stations = this.game.stations, station, position;
  for(var s in stations){
    station = stations[s];
    if(station && station.chassis == chassis){
      position = station.movement.position;
      return station;
    }
  }
};

StationManager.prototype.attacked = function(attacker, target, slot) {
  var stations, station,
      game = this.game,
      stations = this.game.stations;

    for(var s in stations) {
      station = stations[s];
      station.hit(attacker, target, slot);
    }
};

module.exports = StationManager;
