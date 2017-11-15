var engine = require('engine'),
    pixi = require('pixi'),
    UI = require('../ui'),
    NetManager = require('../net/NetManager'),
    Space = require('../fx/Space'),
    Planet = require('../fx/Planet'),
    Snow = require('../fx/Snow'),
    NebulaCluster = require('../fx/NebulaCluster'),
    InputManager = require('../objects/sector/InputManager'),
    ShipManager = require('../objects/sector/ShipManager'),
    StationManager = require('../objects/sector/StationManager'),
    SoundManager = require('../objects/sector/SoundManager'),
    HotkeyManager = require('../objects/sector/HotkeyManager'),
    ExplosionEmitter = require('../objects/sector/emitters/ExplosionEmitter'),
    FlashEmitter = require('../objects/sector/emitters/FlashEmitter'),
    GlowEmitter = require('../objects/sector/emitters/GlowEmitter'),
    ShockwaveEmitter = require('../objects/sector/emitters/ShockwaveEmitter'),
    FireEmitter = require('../objects/sector/emitters/FireEmitter'),
    Asteroid = require('../objects/sector/misc/Asteroid');

function SectorState(game) {
  this.game = game;
  this.auth = game.auth;
};

SectorState.prototype = Object.create(engine.State.prototype);
SectorState.prototype.constructor = engine.State;

SectorState.prototype.init = function(args) {
  // create ui
  this.ui = new UI(this.game);
  this.soundManager = new SoundManager(this.game);

  // disable visibility checks
  this.game.stage.disableVisibilityChange = true;
};

SectorState.prototype.preload = function() {
  // preload ui and sound manager
  this.ui.preload();
  this.soundManager.preload();

  // load background
  this.game.load.image('snow', 'imgs/game/space/snow.jpg');
  this.game.load.image('space', 'imgs/game/space/sector-a.jpg');
  this.game.load.image('nebula', 'imgs/game/space/noise.jpg');

  this.game.load.image('clouds', 'imgs/game/planets/clouds.jpg');
  this.game.load.image('planet', 'imgs/game/planets/talus.jpg');
  this.game.load.image('highlight', 'imgs/game/planets/talus-highlight.jpg');

  // load stations
  this.game.load.image('ubaidian-x01', 'imgs/game/stations/ubaidian-x01.png');
  this.game.load.image('ubaidian-x01-cap', 'imgs/game/stations/ubaidian-cap-x01.png');
  this.game.load.image('general-x01', 'imgs/game/stations/general-x01.png');
  this.game.load.image('general-x01-cap', 'imgs/game/stations/general-cap-x01.png');

  // load strip graphics
  this.game.load.image('laser-blue', 'imgs/game/fx/laser-blue.png');
  this.game.load.image('laser-red', 'imgs/game/fx/laser-red.png');
  this.game.load.image('energy-blue', 'imgs/game/fx/energy-blue.png');
  this.game.load.image('energy-red', 'imgs/game/fx/energy-red.png');

  // load texture atlas
  this.game.load.atlasJSONHash('texture-atlas', 'imgs/game/texture-atlas.png', 'data/texture-atlas.json');

  // load ship configuration
  this.game.load.json('ship-configuration', 'data/ship-configuration.json');
  this.game.load.json('item-configuration', 'data/item-configuration.json');
  this.game.load.json('station-configuration', 'data/station-configuration.json');
};

// loadUpdate = function() {};
// loadRender = function() {};

SectorState.prototype.create = function() {
  var self = this,
      sensitivity = 1000,
      mouse = this.game.input.mouse;
      mouse.capture = true;
      mouse.mouseWheelCallback = function(event) {
        var delta = event.deltaY / sensitivity,
            scale = engine.Math.clamp(this.world.scale.x - delta, 0.34, 1.0);
        if(self.game.paused) { return; }
        if(self.zoom && self.zoom.isRunning) {
          self.zoom.stop();
        }
        this.world.scale.set(scale, scale);
      };

  // set world
  this.game.world.size(0, 0, 4096, 4096);
  this.game.world.scale.set(0.38, 0.38);

  // adjust camera
  this.game.camera.focus(2048, 2048);

  // create sector
  this.createAsteroids();
  this.createManagers();
  this.createSpace();
  this.createEmitters();

  // create ui
  this.ui.create();

  // create SoundManager
  this.soundManager.create();
};

SectorState.prototype.createSpace = function() {
  this.space = new Space(this.game);
  this.space.cache();

  this.planet = new Planet(this.game);

  this.snow = new Snow(this.game, this.game.width, this.game.height);

  this.nebula = new NebulaCluster(this.game);
  this.nebula.position.set(1024 - 128, 1024 - 128);
  this.nebula.create(12, 0.00006, 0.0, [0.2, 0.6, 0.8]);

  this.neb1 = new NebulaCluster(this.game);
  this.neb1.position.set(256, 256);
  this.neb1.create(4, 0.00034, 256, [0.8, 0.2, 0.2]);

  this.neb2 = new NebulaCluster(this.game);
  this.neb2.position.set(128, 128);
  this.neb2.create(4, 0.00034, 256, [1.0, 0.8, 0.2]);

  this.game.world.static.add(this.space);
  this.game.world.static.add(this.snow);
  this.game.world.background.add(this.nebula);
  this.game.world.background.add(this.planet);
  this.game.world.add(this.neb1);
  this.game.world.add(this.neb2);
};

SectorState.prototype.createManagers = function() {
  var game = this.game;

  this.netManager = new NetManager(game, this);
  this.inputManager = new InputManager(game, this);
  this.hotkeyManager = new HotkeyManager(game, this);
  this.stationManager = new StationManager(game, this);
  this.shipManager = new ShipManager(game, this);
};

SectorState.prototype.createAsteroids = function() {
  var game = this.game,
      steroid,
      amount = 32;
  for(var i=0; i<amount; i++) {
    asteroid = new Asteroid(this.game);
    asteroid.position.set(2048 / 4, 2048 / 4);

    game.world.foreground.add(asteroid);
  }
};

SectorState.prototype.createEmitters = function() {
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

  this.game.world.add(this.fireEmitter);
  this.game.world.add(this.flashEmitter);
  this.game.world.add(this.explosionEmitter);
  this.game.world.add(this.shockwaveEmitter);
  this.game.world.add(this.glowEmitter);
};

SectorState.prototype.focus = function() {}

SectorState.prototype.blur = function() {};

SectorState.prototype.update = function() {};

// SectorState.prototype.preRender = function() {};

SectorState.prototype.resize = function(width, height) {
  this.ui && this.ui.resize(width, height);
  this.space && this.space.resize(width, height);
};

// paused = function() {};

// resumed = function() {};

// pauseUpdate = function() {};

SectorState.prototype.shutdown = function() {
  //.. properly destroy
};

module.exports = SectorState;
