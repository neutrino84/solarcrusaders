var engine = require('engine'),
    pixi = require('pixi'),
    Space = require('../fx/Space'),
    Planet = require('../fx/Planet'),
    NebulaCluster = require('../fx/NebulaCluster'),
    // ShockwaveManager = require('../fx/ShockwaveManager'),
    Snow = require('../fx/Snow'),
    InputManager = require('../objects/sector/InputManager'),
    ShipManager = require('../objects/sector/ShipManager'),
    StationManager = require('../objects/sector/StationManager'),
    Asteroid = require('../objects/sector/misc/Asteroid');
    
function SectorState() {}

SectorState.prototype = Object.create(engine.State.prototype);
SectorState.prototype.constructor = engine.State;

SectorState.prototype.init = function(args) {
  global.state = this;

  this.scrollLock = false;
  this.game.stage.disableVisibilityChange = true;
};

SectorState.prototype.preload = function() {
  var game  = this.game;

  // load background
  game.load.image('space', 'imgs/game/space/sector-a.jpg');
  game.load.image('nebula', 'imgs/game/space/nebula-a.jpg');
  game.load.image('snow', 'imgs/game/space/snow.jpg');

  // game.load.image('draghe', 'imgs/game/planets/draghe.jpg');
  // game.load.image('eamon', 'imgs/game/planets/eamon-alpha.jpg');
  // game.load.image('arkon', 'imgs/game/planets/arkon.jpg');
  game.load.image('planet', 'imgs/game/planets/eamon-alpha.jpg');
  game.load.image('clouds', 'imgs/game/planets/clouds.jpg');

  // load stations
  game.load.image('station', 'imgs/game/stations/ubaidian-x01.png');
  game.load.image('station-cap', 'imgs/game/stations/ubaidian-cap-x01.png');

  game.load.image('laser-blue', 'imgs/game/fx/laser-blue.png');
  game.load.image('laser-red', 'imgs/game/fx/laser-red.png');

  // test load sound
  // load.audio('background', 'imgs/game/sounds/mood.mp3');

  // load texture atlas
  game.load.atlasJSONHash('texture-atlas', 'imgs/game/texture-atlas.png', 'data/texture-atlas.json');

  // load ship configuration
  game.load.json('ship-configuration', 'data/ship-configuration.json');
  game.load.json('item-configuration', 'data/item-configuration.json');
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
            scale = engine.Math.clamp(this.world.scale.x - delta, 0.2, 1.0);
        if(self.game.paused) { return; }
        if(self.zoom && self.zoom.isRunning) {
          self.zoom.stop();
        }
        this.world.scale.set(scale, scale);
      };

  this.game.world.setBounds(0, 0, 4096, 4096);
  this.game.world.scale.set(0.2, 0.2);

  this.game.camera.bounds = null;
  this.game.camera.focusOnXY(2048, 2048);

  // create sector
  this.createManagers();
  // this.createAsteroids();
  this.createSpace();
  this.createSnow();

  // AUDIO TEST
  // this.sound = this.game.sound.add('background', 0, true);
  // this.sound.on('decoded', function() {
  //   this.play('', 0, 0, true);
  //   this.fadeTo(12000, 0.01);
  // });

  // start zoom in
  // this.game.once('ship/follow', function() {
  //   this.zoom = this.game.tweens.create(this.game.world.scale);
  //   this.zoom.to({ x: 0.2, y: 0.2 }, 3000, engine.Easing.Quadratic.InOut, true);
  // }, this);

  // login
  // if(game.auth.ready) {
  //   this.game.gui.login(game.auth.user);
  // }

  // initialize net manager
  this.game.shipNetManager.init();

  // benchmark
  // this.game.clock.benchmark();

  // notify
  this.game.emit('gui/focus/retain', this);

  // subscribe
  this.game.on('gui/selected', function() {
    this.game.emit('gui/focus/retain', this);
  }, this);
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
  // this.shockwaveManager = new ShockwaveManager(this.game, this);

  this.stationManager = new StationManager(this.game);
  this.stationManager.boot();
  
  this.shipManager = new ShipManager(this.game);
  this.inputManager = new InputManager(this.game);
};

SectorState.prototype.createSnow = function() {
  this.snow = new Snow(this.game, this.game.width, this.game.height);
  this.game.stage.addChild(this.snow);
};

SectorState.prototype.createAsteroids = function() {
  var asteroid, amount = 80;
  for(var i=0; i<amount; i++) {
    asteroid = new Asteroid(this.game);
    asteroid.position.set(2048 / 4, 2048 / 4);

    this.game.world.foreground.add(asteroid);
  }
};

SectorState.prototype.focus = function() {
  this.scrollLock = false;
  // this.shipManager.focus();
}

SectorState.prototype.blur = function() {
  this.scrollLock = true;
  // this.shipManager.blur();
};

SectorState.prototype.update = function() {
  var game = this.game,
      camera = game.camera,
      keyboard = game.input.keyboard,
      x = 0, y = 0,
      amount = 1024;

  if(!this.scrollLock) {
    if(keyboard.isDown(engine.Keyboard.A) || keyboard.isDown(engine.Keyboard.LEFT)) {
      x = -amount;
    }
    if(keyboard.isDown(engine.Keyboard.D) || keyboard.isDown(engine.Keyboard.RIGHT)) {
      x = amount;
    }
    if(keyboard.isDown(engine.Keyboard.W) || keyboard.isDown(engine.Keyboard.UP)) {
      y = -amount;
    }
    if(keyboard.isDown(engine.Keyboard.S) || keyboard.isDown(engine.Keyboard.DOWN)) {
      y = amount;
    }
  } else {
    x = y = 0;
  }

  // apply velocity
  camera.offset.setTo(x, y);
};

SectorState.prototype.preRender = function() {
  // this.shockwaveManager.preRender();
};

SectorState.prototype.resize = function(width, height) {
  this.space && this.space.resize(width, height);
  this.snow && this.snow.resize(width, height);
};

// paused = function() {};

// resumed = function() {};

// pauseUpdate = function() {};

SectorState.prototype.shutdown = function() {
  this.inputManager.destroy();
};

module.exports = SectorState;
