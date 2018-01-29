
var uuid = require('uuid'),
    engine = require('engine'),
    Station = require('./objects/Station');

function StationManager(game) {
  this.game = game;
  this.model = game.model;
  this.sockets = game.sockets;

  // global stations
  this.game.stations = {};
};

StationManager.prototype.constructor = StationManager;

StationManager.prototype.init = function() {
  // listen to station messaging
  this.game.on('station/remove', this.remove, this);
  this.game.on('station/create', this.create, this);

  // listen to ship attack messaging
  this.game.on('ship/attacked', this.attacked, this);
};

StationManager.prototype.add = function(station) {
  var game = this.game,
      stations = game.stations;

  // check if exists
  if(stations[station.uuid] == undefined) {
    stations[station.uuid] = station;
  }

  // station added to world
  game.emit('station/add', station);
};

StationManager.prototype.create = function(data) {
  var game = this.game,
      station = new Station(game, data);
      station.init(this.add, this);
};

StationManager.prototype.remove = function() {
  var game = this.game,
      station = game.stations[data.uuid];
      station && station.destroy();
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
        chassis: station.chassis,
        race: station.data.race,
        x: station.data.x,
        y: station.data.y,
        disabled: station.disabled,
        rotation: station.movement.rotation,
        spin: station.movement.spin,
        period: station.movement.period,
        speed: station.movement.speed,
        radius: station.radius,
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
      // update
      movement = station.movement;
      movement.update();

      // package
      position = movement.position;
      data = {
        uuid: station.uuid,
        prd: movement.period,
        spd: movement.speed,
        rot: movement.rotation,
        spn: movement.spin
      };
    }

    synced.push(data);
  }
  return synced;
};

StationManager.prototype.attacked = function(attacker, target, slot) {
  var game = this.game,
      stations = game.stations,
      station;
  for(var s in stations) {
    station = stations[s];

    if(!station.disabled) {
      station.hit(attacker, target, slot);
    }
  }
};

module.exports = StationManager;
