
var uuid = require('uuid'),
    engine = require('engine'),
    Station = require('./objects/Station');

function StationManager(game) {
  this.game = game;
  this.model = game.model;
  this.sockets = game.sockets.ioserver;

  this.game.on('station/add', this.add, this);

  this.stations = {};

  this.game.clock.events.loop(1000, this.refresh, this);
};

StationManager.prototype.constructor = StationManager;

StationManager.prototype.init = function() {
  // io router
  this.game.on('station/data', this.data.bind(this));

  // this.game.on('station/position', this.position, this);

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

StationManager.prototype.data = function(socket, args, next) {
  var station,
      uuid,
      uuids = args[1].uuids,
      user = socket.request.session.user,
      sockets = this.sockets,
      stations = [];

  for(var u in uuids) {
    station = this.stations[uuids[u]];
    if(station && args[1].position) {
      stations.push({
        uuid: station.uuid,
        name: station.data.name,
        x: args[1].position.x,
        y: args[1].position.y,
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
      station.data.x = args[1].position.x;
      station.data.y = args[1].position.y;
      // console.log(station.data.x, station.data.y)
      // debugger

    } else if(station) {
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
  sockets.emit('station/data', {
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
      orbit = station.orbit;
      orbit.update();
      // console.log('in update period is', station.period)
      
      // console.log(orbit)
      data = {
        uuid: station.uuid
      };
    }

    synced.push(data);
  }
  // console.log('about to sync from manager update. synced.length is ', synced)
  sockets.emit('station/sync', {
    stations: synced
  });

  // sockets.emit('station/data', {
  //   type: 'sync', stations: synced
  // });
};

StationManager.prototype.refresh = function() {
  var sation, delta,
      stations = this.stations,
      update, updates = [],
      stats;
  for(var s in stations) {
    station = stations[s];
    delta = station.data.speed * (1/60) * (1/100);
    station.period += delta;
    
      stats = station.config.stats;
      update = { uuid: station.uuid };

      update.period = station.period;
      // update health
      if(station.health < stats.health) {
        update.health = engine.Math.roundTo(station.health, 1);
      }

      // push deltas
      // if(delta !== undefined) {
        updates.push(update);
      // }
    
  }
  if(updates.length > 0) {
    this.sockets.emit('station/data', {
      type: 'update', stations: updates
    });
  }
};

StationManager.prototype.generateStation = function() {
  this.create({
    x: 2048,
    y: 2048,
    chassis: 'ubadian-station-x01'
  });

  // this.create({
  //   x: -2392,
  //   y: 2892,
  //   chassis: 'scavenger-nest-x01',
  //   radius: 0
  // });

  // this.create({
  //   x: 2392,
  //   y: -2892,
  //   chassis: 'scavenger-nest-x01',
  //   radius: 0
  // });
};

module.exports = StationManager;
