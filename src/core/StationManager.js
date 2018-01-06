
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
  
  // listen to messaging
  this.game.on('station/add', this.add, this);
  this.game.on('station/create', this.create, this);
  this.game.on('ship/attacked', this.attacked, this);
  this.game.on('station/disabled', this.disabled, this);
  this.game.on('game/over', this.removeAllStations, this);

  this.game.clock.events.loop(1000, this.update, this);
};

StationManager.prototype.add = function(station) {
  if(this.game.stations[station.uuid] === undefined) {
    this.game.stations[station.uuid] = station;
  }
};

StationManager.prototype.remove = function(station) {
  var stations = this.game.stations,
      s = stations[station.uuid];
  if(s !== undefined) {
    delete this.game.stations[station.uuid] && s.destroy();
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
        armor: station.armor,
        faction : station.faction
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

StationManager.prototype.update = function() {
  var stations = this.game.stations,
      station, delta, update, stats,
      updates = [];
  for(var s in stations) {
    station = stations[s];
    if(!station.disabled) {
      stats = station.config.stats;
      update = { uuid: station.uuid };
      
      // update health
      if(station.health < stats.health) {
        delta = station.heal;
        station.health = global.Math.min(stats.health, station.health + delta);
        update.health = engine.Math.roundTo(station.health, 1);
      };

      // push deltas
      if(delta !== undefined) {
        updates.push(update);
      }
      if(station.docked){
        update.docked = true;
        updates.push(update)
      }
    }
  }
  if(updates.length > 0) {
    this.game.emit('station/data', updates);
  }
};

StationManager.prototype.getStation = function(chassis) {
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

StationManager.prototype.disabled = function(data) {
  this.sockets.send('station/disabled', data);
};

StationManager.prototype.removeAllStations = function() {
  for(var s in this.game.stations){
    this.remove(this.game.stations[s]);
  }
};

module.exports = StationManager;
