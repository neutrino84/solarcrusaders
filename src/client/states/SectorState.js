var engine = require('engine'),
    pixi = require('pixi'),
    UI = require('../ui'),
    ShipNetManager = require('../net/ShipNetManager'),
    StationNetManager = require('../net/StationNetManager'),
    Space = require('../fx/Space'),
    Planet = require('../fx/Planet'),
    NebulaCluster = require('../fx/NebulaCluster'),
    ShockwaveManager = require('../fx/ShockwaveManager'),
    Snow = require('../fx/Snow'),
    InputManager = require('../objects/sector/InputManager'),
    ShipManager = require('../objects/sector/ShipManager'),
    StationManager = require('../objects/sector/StationManager'),
    Asteroid = require('../objects/sector/misc/Asteroid');
    
function SectorState(game) {
  this.shipNetManager = new ShipNetManager(game);
  this.stationNetManager = new StationNetManager(game);
};

SectorState.prototype = Object.create(engine.State.prototype);
SectorState.prototype.constructor = engine.State;

SectorState.prototype.init = function(args) {
  // initialize
  this.shipNetManager.init();
  this.stationNetManager.init();

  // instanciate ui
  this.ui = new UI(this.game);

  // this.scrollLock = false;
  this.game.stage.disableVisibilityChange = true;
};

SectorState.prototype.preload = function() {
  // preload ui
  this.ui.preload();

  // load background
  this.game.load.image('space', 'imgs/game/space/sector-a.jpg');
  this.game.load.image('nebula', 'imgs/game/space/nebula-a.jpg');
  this.game.load.image('snow', 'imgs/game/space/snow.jpg');

  this.game.load.image('planet', 'imgs/game/planets/eamon-alpha.jpg');
  this.game.load.image('clouds', 'imgs/game/planets/clouds.jpg');

  // load stations
  this.game.load.image('ubadian-station-x01', 'imgs/game/stations/ubaidian-x01.png');
  this.game.load.image('ubadian-station-x01-cap', 'imgs/game/stations/ubaidian-cap-x01.png');

  // load strip graphics
  this.game.load.image('laser-blue', 'imgs/game/fx/laser-blue.png');
  this.game.load.image('laser-red', 'imgs/game/fx/laser-red.png');
  this.game.load.image('laser-vulcan', 'imgs/game/fx/laser-vulcan.png');
  this.game.load.image('laser-heavy', 'imgs/game/fx/laser-heavy.png');
  this.game.load.image('laser-gaus', 'imgs/game/fx/laser-gaus.png');

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
            scale = engine.Math.clamp(this.world.scale.x - delta, 0.16, 1.0);
        if(self.game.paused) { return; }
        if(self.zoom && self.zoom.isRunning) {
          self.zoom.stop();
        }
        this.world.scale.set(scale, scale);
      };

  this.game.world.setBounds(0, 0, 4096, 4096);
  this.game.world.scale.set(0.16, 0.16);

  this.game.camera.bounds = null;
  this.game.camera.focusOnXY(2048, 2048);

  // create sector
  this.createManagers();
  this.createAsteroids();
  this.createSpace();
  this.createSnow();

  // AUDIO TEST
  // this.sound = this.game.sound.add('background', 0, true);
  // this.sound.on('decoded', function() {
  //   this.play('', 0, 0, true);
  //   this.fadeTo(12000, 0.01);
  // });

  // login
  // if(game.auth.ready) {
  //   this.game.gui.login(game.auth.user);
  // }

  // create ui
  this.ui.create();
};

SectorState.prototype.createSpace = function() {
  this.space = new Space(this.game);
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

  this.inputManager = new InputManager(game, this);
  this.stationManager = new StationManager(game, this);
  this.shipManager = new ShipManager(game, this);
  // this.shockwaveManager = new ShockwaveManager(game, this);
};

SectorState.prototype.createSnow = function() {
  this.snow = new Snow(this.game, this.game.width, this.game.height);
  this.game.world.front.add(this.snow);
};

SectorState.prototype.createAsteroids = function() {
  var asteroid, amount = 30;
  for(var i=0; i<amount; i++) {
    asteroid = new Asteroid(this.game);
    asteroid.position.set(2048 / 4, 2048 / 4);

    this.game.world.foreground.add(asteroid);
  }
};

SectorState.prototype.focus = function() {
  // this.scrollLock = false;
  // this.shipManager.focus();
}

SectorState.prototype.blur = function() {
  // this.scrollLock = true;
  // this.shipManager.blur();
};

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

SectorState.prototype.preRender = function() {
  // this.shockwaveManager.preRender();
};

SectorState.prototype.resize = function(width, height) {
  this.space && this.space.resize(width, height);
  this.snow && this.snow.resize(width, height);
  this.ui && this.ui.resize(width, height);
};

// paused = function() {};

// resumed = function() {};

// pauseUpdate = function() {};

SectorState.prototype.shutdown = function() {
  //.. properly destroy
};

module.exports = SectorState;
