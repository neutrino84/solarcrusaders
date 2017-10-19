
var engine = require('engine'),
    Station = require('./Station'),
    ExplosionEmitter = require('./emitters/ExplosionEmitter'),
    FlashEmitter = require('./emitters/FlashEmitter'),
    GlowEmitter = require('./emitters/GlowEmitter'),
    ShockwaveEmitter = require('./emitters/ShockwaveEmitter'),
    FireEmitter = require('./emitters/FireEmitter');

function StationManager(game, state) {
  this.game = game;
  this.state = state;
  this.socket = game.net.socket;
  this.stationsGroup = new engine.Group(game);

  this.trajectoryGraphics = new engine.Graphics(game);
  this.stationsGroup.addChild(this.trajectoryGraphics);

  // stations
  this.stations = {};

  // create emitters
  this.explosionEmitter = new ExplosionEmitter(this.game);
  this.flashEmitter = new FlashEmitter(this.game);
  this.glowEmitter = new GlowEmitter(this.game);
  this.shockwaveEmitter = new ShockwaveEmitter(this.game);
  this.fireEmitter = new FireEmitter(this.game);

  this.game.particles.add(this.explosionEmitter);
  this.game.particles.add(this.flashEmitter);
  this.game.particles.add(this.glowEmitter);
  this.game.particles.add(this.shockwaveEmitter);
  this.game.particles.add(this.fireEmitter);


  // listen to messaging
  this.game.on('auth/disconnect', this.disconnect, this);
  this.game.on('sector/sync', this.sync, this);

  this.game.on('station/find', this.findStation, this);
  this.game.on('station/disabled', this._disabled, this);

  // add to world
  this.game.world.foreground.add(this.stationsGroup);

  this.game.world.foreground.add(this.fireEmitter);
  this.game.world.foreground.add(this.explosionEmitter);
  this.game.world.foreground.add(this.flashEmitter);
  this.game.world.foreground.add(this.shockwaveEmitter);
  this.game.world.foreground.add(this.glowEmitter);

  this.happened = false;
}

StationManager.prototype.constructor = StationManager;

StationManager.prototype.test = function(data) {
  console.log('in station manager.test - data is ', data)
}

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

StationManager.prototype._disabled = function(data) {
  var station = this.stations[data.uuid],
      socket = this.socket,
      clock = this.clock,
      game = this.game, chassis;
      console.log(' de heck.. station disabled!', data)
  if(station !== undefined) {
    chassis = station.data.chassis;

    console.log(chassis, 'station disabled!')
    station.disable();
    station.explode();

    // this.game.emit('station/sound/death', station);
  };
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

    // console.log('in station manager, sync function. netManager is ', this.netManager)
    if(station) {
      if(station.key == 'ubadian-station-x01' && !this.happened){
        this.happened = true;
        this.game.world.scale.set(1, 1);
        // this.game.camera.follow(station);
        // this.game.clock.events.add(1000, function(){
        //   this.game.emit('')
        // }, this);
      }
      
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

  this.game.removeListener('station/find', this.findStation);
  this.game.removeListener('station/disabled', this._disabled);

  this.removeAll();

  this.game = this.socket = this._syncBind =
   this._attackBind = undefined;
};

StationManager.prototype.disconnect = function() {
  this.removeAll();
};

module.exports = StationManager;
