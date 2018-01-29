
var engine = require('engine'),
    Station = require('./Station');

function StationManager(game) {
  this.game = game;
  this.socket = game.net.socket;
  this.stationsGroup = new engine.Group(game);

  this.trajectoryGraphics = new engine.Graphics(game);
  this.stationsGroup.addChild(this.trajectoryGraphics);

  // stations
  this.game.stations = {};

  // listen to messaging
  this.game.on('auth/disconnect', this.disconnect, this);
  this.game.on('sector/sync', this.syncronize, this);
  this.game.on('station/create', this.create, this);

  // add to world
  this.game.world.add(this.stationsGroup);

  // update data interval
  this.game.clock.events.loop(1000, this.update, this);
}

StationManager.prototype.constructor = StationManager;

StationManager.prototype.create = function(data) {
  var game = this.game,
      stationsGroup = this.stationsGroup,
      station = new Station(this, data);

  // create
  station.create();
  stationsGroup.addAt(station);
  game.stations[data.uuid] = station;
};

StationManager.prototype.syncronize = function(data) {
  var game = this.game,
      stations = game.stations,
      syncronize = data.stations,
      sync, station;
  for(var s=0; s<syncronize.length; s++) {
    sync = syncronize[s];
    station = stations[sync.uuid];
    station && station.plot(sync);

    // if() {
      // if(game.rnd.frac() > 0.5) {
      //   this.trajectoryGraphics.lineStyle(0);
      //   this.trajectoryGraphics.beginFill(0x6666FF, 1.0);
      //   this.trajectoryGraphics.drawCircle(station.x, station.y, 12);
      //   this.trajectoryGraphics.endFill();
      //   this.trajectoryGraphics.lineStyle(1.0);
      //   this.trajectoryGraphics.beginFill(0xFFFFFF, 1.0);
      //   this.trajectoryGraphics.drawCircle(sync.pos.x, sync.pos.y, 6);
      //   this.trajectoryGraphics.endFill();
      // }

      // station.position.set(sync.pos.x, sync.pos.y);
      // station.rotation = sync.rot;
    // }
  }
};

StationManager.prototype.update = function() {
  var game = this.game,
      stations = game.stations,
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
      }

      // push deltas
      if(delta !== undefined) {
        updates.push(update);
      }
    }
  }
  if(updates.length > 0) {
    game.emit('station/data', updates);
  }
};

StationManager.prototype.remove = function(data) {
  var game = this.game,
      stations = game.stations,
      station = stations[data.uuid];
  if(station !== undefined) {
    // destroy
    station.destroy();

    // remove from memory
    delete stations[station.uuid];
  }
};

StationManager.prototype.removeAll = function() {
  var game = this.game,
      stations = game.stations;
  for(var s in stations) {
    // remove all ships
    this.remove(stations[s]);
  }
};

StationManager.prototype.destroy = function() {
  this.game.removeListener('auth/disconnect', this.disconnect);
  this.game.removeListener('sector/sync', this.sync);

  this.removeAll();

  this.game = this.socket = undefined;
};

StationManager.prototype.disconnect = function() {
  this.removeAll();
};

module.exports = StationManager;
