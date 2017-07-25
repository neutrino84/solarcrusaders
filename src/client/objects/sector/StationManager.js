
var engine = require('engine'),
    Station = require('./Station');

function StationManager(game, state) {
  this.game = game;
  this.state = state;
  this.socket = game.net.socket;
  this.stationsGroup = new engine.Group(game);

  this.trajectoryGraphics = new engine.Graphics(game);
  this.stationsGroup.addChild(this.trajectoryGraphics);

  // stations
  this.stations = {};

  // listen to messaging
  this.game.on('auth/disconnect', this.disconnect, this);
  this.game.on('sector/sync', this.sync, this);

  // add to world
  this.game.world.foreground.add(this.stationsGroup);
}

StationManager.prototype.constructor = StationManager;

StationManager.prototype.create = function(data) {
  var game = this.game,
      state = this.state,
      stations = this.stations,
      container = this.stationsGroup,
      station = new Station(this, data),
      user = state.auth.user;

  // set data
  station.uuid = data.uuid;
  station.boot();

  // add station registry
  stations[data.uuid] = station;

  // display
  container.addAt(station, 0);

  // focus if no player ship
  if(!user.ship) {
    //..
  }
};

StationManager.prototype.sync = function(data) {
  var game = this.game,
      netManager = this.state.netManager,
      stations = data.stations,
      length = stations.length,
      sync, station, model;
  for(var s=0; s<length; s++) {
    sync = stations[s];
    station = this.stations[sync.uuid];

    if(station) {
      station.plot(sync);

      // if(this.game.rnd.frac() > 0.9) {

      //   console.log(engine.Point.distance(station, sync.pos))

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
    } else {
      model = netManager.getStationData(sync.uuid);
      model && this.create(model);
    }
  }
};

StationManager.prototype.remove = function(data) {
  var stations = this.stations,
      station = stations[data.uuid];
  if(station !== undefined) {
    station.destroy();
    delete stations[station.uuid];
  }
};

StationManager.prototype.removeAll = function() {
  var station,
      stations = this.stations;
  for(var s in stations) {
    this.remove(stations[s]);
  }
};

StationManager.prototype.destroy = function() {
  this.game.removeListener('auth/disconnect', this.disconnect);
  this.game.removeListener('sector/sync', this.sync);

  this.removeAll();

  this.game = this.socket = this._syncBind =
   this._attackBind = undefined;
};

StationManager.prototype.disconnect = function() {
  this.removeAll();
};

module.exports = StationManager;
