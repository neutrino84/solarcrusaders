var engine = require('engine'),
    pixi = require('pixi'),
    UI = require('../ui'),
    NetManager = require('../net/NetManager'),
    Space = require('../fx/Space'),
    Planet = require('../fx/Planet'),
    NebulaCluster = require('../fx/NebulaCluster'),
    Snow = require('../fx/Snow'),
    InputManager = require('../objects/sector/InputManager'),
    ShipManager = require('../objects/sector/ShipManager'),
    StationManager = require('../objects/sector/StationManager'),
    SquadManager = require('../objects/sector/SquadManager'),
    SoundManager = require('../objects/sector/SoundManager'),
    HotkeyManager = require('../objects/sector/HotkeyManager'),
    Asteroid = require('../objects/sector/misc/Asteroid');
    
function SectorState(game) {
  this.game = game;
  this.auth = game.auth;
};

SectorState.prototype = Object.create(engine.State.prototype);
SectorState.prototype.constructor = engine.State;

SectorState.prototype.init = function(args) {
  // instanciate ui
  this.ui = new UI(this.game);

  this.soundManager = new SoundManager(this.game);

  // this.scrollLock = false;
  this.game.stage.disableVisibilityChange = true;
};

SectorState.prototype.preload = function() {
  // preload ui and sound manager
  this.ui.preload();
  this.soundManager.preload();

  // load background
  this.game.load.image('space', 'imgs/game/space/sector-a.jpg');
  this.game.load.image('nebula', 'imgs/game/space/nebula-a.jpg');
  this.game.load.image('snow', 'imgs/game/space/snow.jpg');

  this.game.load.image('planet', 'imgs/game/planets/eamon-alpha.jpg');
  this.game.load.image('clouds', 'imgs/game/planets/clouds.jpg');

  // load stations
  this.game.load.image('ubadian-station-x01', 'imgs/game/stations/ubaidian-x01.png');
  this.game.load.image('ubadian-station-x01-cap', 'imgs/game/stations/ubaidian-cap-x01.png');
  this.game.load.image('scavenger-x01', 'imgs/game/stations/scavenger-x01.png');
  this.game.load.image('scavenger-x01-cap', 'imgs/game/stations/scavenger-x01.png');

  // load strip graphics
  this.game.load.image('laser-blue', 'imgs/game/fx/laser-blue.png');
  this.game.load.image('laser-blue2', 'imgs/game/fx/laser-blue2.png');
  this.game.load.image('laser-blue3', 'imgs/game/fx/laser-blue3.png');
  this.game.load.image('laser-red', 'imgs/game/fx/laser-red.png');
  this.game.load.image('laser-red2', 'imgs/game/fx/laser-red2.png');
  this.game.load.image('laser-red3', 'imgs/game/fx/laser-red3.png');
  this.game.load.image('laser-green', 'imgs/game/fx/laser-green.png');
  this.game.load.image('laser-green2', 'imgs/game/fx/laser-green2.png');
  this.game.load.image('laser-green3', 'imgs/game/fx/laser-green3.png');
  this.game.load.image('laser-purple', 'imgs/game/fx/laser-purple.png');
  this.game.load.image('laser-yellow', 'imgs/game/fx/laser-yellow.png');
  this.game.load.image('laser-yellow2', 'imgs/game/fx/laser-yellow2.png');
  this.game.load.image('laser-yellow3', 'imgs/game/fx/laser-yellow3.png');
  this.game.load.image('laser-yellow-long', 'imgs/game/fx/laser-yellow-long.png');
  this.game.load.image('laser-vulcan', 'imgs/game/fx/laser-vulcan.png');
  this.game.load.image('laser-heavy', 'imgs/game/fx/laser-heavy.png');
  this.game.load.image('laser-bazuko', 'imgs/game/fx/laser-bazuko.png');
  this.game.load.image('laser-bazuko2', 'imgs/game/fx/laser-bazuko2.png');
  this.game.load.image('laser-bazuko3', 'imgs/game/fx/laser-bazuko3.png');
  this.game.load.image('laser-gaus', 'imgs/game/fx/laser-gaus.png');
// 
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
            scale = engine.Math.clamp(this.world.scale.x - delta, 0.5, 1.0);
        if(self.game.paused) { return; }
        if(self.zoom && self.zoom.isRunning) {
          self.zoom.stop();
        }
        this.world.scale.set(scale, scale);
      };

  // set world
  this.game.world.size(0, 0, 4096, 4096);
  this.game.world.scale.set(.6, .6);

  // adjust camera
  this.game.camera.focus(2048, 2048);

  // create sector
  this.createAsteroids();
  this.createManagers();
  this.createSpace();
  this.createSnow();

  // create ui
  this.ui.create();

  // create SoundManager
  this.soundManager.create();

  this.game.emit('game/backgroundmusic')
};

SectorState.prototype.createSpace = function() {
  this.space = new Space(this.game);
  this.space.cache();

  this.planet = new Planet(this.game);

  this.nebula = new NebulaCluster(this.game);
  this.nebula.position.set(-256, 1024);
  this.nebula.create(3);

  this.game.world.static.add(this.space);
  this.game.world.background.add(this.planet);
  this.game.world.foreground.add(this.nebula);
};

SectorState.prototype.createManagers = function() {
  var game = this.game;

  this.netManager = new NetManager(game, this);
  this.inputManager = new InputManager(game, this);
  this.hotkeyManager = new HotkeyManager(game, this);
  this.stationManager = new StationManager(game, this);
  this.shipManager = new ShipManager(game, this);
  this.squadManager = new SquadManager(game, this);

  this.squadManager.create(this);
  // this.playerManager.create(this);
  this.hotkeyManager.create(this);
};

SectorState.prototype.createSnow = function() {
  this.snow = new Snow(this.game, this.game.width, this.game.height);
  this.game.world.front.add(this.snow);
};

SectorState.prototype.createAsteroids = function() {
  var game = this.game,
      steroid,
      amount = 64;
  for(var i=0; i<amount; i++) {
    asteroid = new Asteroid(this.game);
    asteroid.position.set(2048 / 4, 2048 / 4);

    game.world.foreground.add(asteroid);
  }
};

SectorState.prototype.focus = function() {}

SectorState.prototype.blur = function() {};

SectorState.prototype.update = function() {
  // var game = this.game,
  //     camera = game.camera,
  //     keyboard = game.input.keyboard,
  //     x = 0, y = 0,
  //     amount = 1024;

  // if(!this.scrollLock) {
  //   if(keyboard.isDown(engine.Keyboard.A) || keyboard.isDown(engine.Keyboard.LEFT)) {
  //     x = -amount;
  //   }
  //   if(keyboard.isDown(engine.Keyboard.D) || keyboard.isDown(engine.Keyboard.RIGHT)) {
  //     x = amount;
  //   }
  //   if(keyboard.isDown(engine.Keyboard.W) || keyboard.isDown(engine.Keyboard.UP)) {
  //     y = -amount;
  //   }
  //   if(keyboard.isDown(engine.Keyboard.S) || keyboard.isDown(engine.Keyboard.DOWN)) {
  //     y = amount;
  //   }
  // } else {
  //   x = y = 0;
  // }

  // apply velocity
  // camera.offset.setTo(x, y);
};

// SectorState.prototype.preRender = function() {};

SectorState.prototype.resize = function(width, height) {
  this.ui && this.ui.resize(width, height);
  this.space && this.space.resize(width, height);
  this.snow && this.snow.resize(width, height);
};

// paused = function() {};

// resumed = function() {};

// pauseUpdate = function() {};

SectorState.prototype.shutdown = function() {
  //.. properly destroy
};

module.exports = SectorState;
