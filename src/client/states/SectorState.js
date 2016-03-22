var engine = require('engine'),
    Space = require('../fx/Space'),
    Planet = require('../fx/Planet'),
    Snow = require('../fx/Snow'),
    Selection = require('../objects/sector/Selection'),
    ShipManager = require('../objects/sector/ShipManager'),
    Asteroid = require('../objects/sector/misc/Asteroid');
    
function SectorState() {}

SectorState.prototype = Object.create(engine.State.prototype);
SectorState.prototype.constructor = engine.State;

SectorState.prototype.init = function(args) {
  global.state = this;

  this.scrollVelocityX = 0;
  this.scrollVelocityY = 0;

  this.scrollLock = true;
  this.game.stage.disableVisibilityChange = true;
};

SectorState.prototype.preload = function() {
  var load = this.game.load;

  // load background
  load.image('space', 'imgs/game/space/sector-a.jpg');
  load.image('nebula', 'imgs/game/space/nebula-a.jpg');

  // load.image('draghe', 'imgs/game/planets/draghe.jpg');
  // load.image('eamon', 'imgs/game/planets/eamon-alpha.jpg');
  // load.image('arkon', 'imgs/game/planets/arkon.jpg');
  load.image('talus', 'imgs/game/planets/talus.jpg');
  load.image('clouds', 'imgs/game/planets/clouds.jpg');

  load.image('laser-red', 'imgs/game/fx/laser-red.png');
  load.image('laser-blue', 'imgs/game/fx/laser-blue.png');
  // load.image('trails', 'imgs/game/fx/trails.png');

  // test load sound
  load.audio('background', 'imgs/game/sounds/mood.mp3');
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
            scale = engine.Math.clamp(this.world.scale.x - delta, 0.25, 1.0);
        if(self.game.paused) { return; }
        if(self.zoom && self.zoom.isRunning) {
          self.zoom.stop();
        }
        this.world.scale.set(scale, scale);
      };

  this.game.world.setBounds(0, 0, 4096, 4096);
  this.game.world.scale.set(0.34, 0.34);

  this.game.camera.bounds = null;
  this.game.camera.focusOnXY(2048, 2048);

  // create sector
  this.createManagers();
  this.createSpace();
  this.createSnow();
  this.createAsteroids();

  // AUDIO TEST
  this.sound = this.game.sound.add('background', 0.5, true);
  this.sound.on('decoded', function() {
    this.fadeIn(12000, true);
  });

  // start zoom in
  this.game.once('ship/follow', function() {
    this.zoom = this.game.tweens.create(this.game.world.scale);
    this.zoom.to({ x: 0.66, y: 0.66 }, 6000, engine.Easing.Quadratic.InOut, true);
  }, this);

  // login
  if(game.net.connected) {
    this.game.gui.login(game.auth.user);
  }

  // benchmark
  this.game.clock.benchmark();

  // notify
  this.game.emit('gui/focus/retain', this);

  // subscribe
  this.game.on('gui/selected', function() {
    this.game.emit('gui/focus/retain', this);
  }, this);
};

SectorState.prototype.createSpace = function() {
  this.space = new Space(this.game, this.game.width, this.game.height);
  
  this.planet = new Planet(this.game, 'talus');
  this.planet.position.set(2048 / 6, 2048 / 6);

  this.game.world.background.add(this.planet);
  this.game.stage.addChildAt(this.space, 0);
};

SectorState.prototype.createManagers = function() {
  this.shipManager = new ShipManager(this.game);
  this.shipManager.hudGroup = this.game.gui.hud;
  this.selection = new Selection(this);
};

SectorState.prototype.createSnow = function() {
  this.snow = new Snow(this.game, this.game.width, this.game.height);
  this.game.stage.addChild(this.snow);
  this.game.stage.swapChildren(this.snow, this.game.gui.root);
};

SectorState.prototype.createAsteroids = function() {
  var asteroid, amount = 100;
  for(var i=0; i<amount; i++) {
    asteroid = new Asteroid(this.game);
    asteroid.position.set(2048 / 4, 2048 / 4);

    this.game.world.foreground.add(asteroid);
  }
};

SectorState.prototype.focus = function() {
  this.scrollLock = false;
  this.shipManager.focus();
}

SectorState.prototype.blur = function() {
  this.scrollLock = true;
  this.shipManager.blur();
};

SectorState.prototype.update = function() {
  var game = this.game,
      camera = game.camera,
      keyboard = game.input.keyboard,
      timeStep = game.clock.elapsedMS / 10,
      move = 1.12 * timeStep;

  if(this.scrollLock) { return; }

  // add velocity on keypress
  if(keyboard.isDown(engine.Keyboard.A) || keyboard.isDown(engine.Keyboard.LEFT)) {
    this.scrollVelocityX += move;
  }
  if(keyboard.isDown(engine.Keyboard.D) || keyboard.isDown(engine.Keyboard.RIGHT)) {
    this.scrollVelocityX -= move;
  }
  if(keyboard.isDown(engine.Keyboard.W) || keyboard.isDown(engine.Keyboard.UP)) {
    this.scrollVelocityY += move;
  }
  if(keyboard.isDown(engine.Keyboard.S) || keyboard.isDown(engine.Keyboard.DOWN)) {
    this.scrollVelocityY -= move;
  }

  // apply velocity
  camera.pan(this.scrollVelocityX, this.scrollVelocityY);
  
  // apply friction
  if(this.scrollVelocityX > 0 || this.scrollVelocityX < 0) {
    this.scrollVelocityX /= 1.1;
  }
  if(this.scrollVelocityX > -0.05 && this.scrollVelocityX < 0.05) {
    this.scrollVelocityX = 0;
  }
  if(this.scrollVelocityY > 0 || this.scrollVelocityY < 0) {
    this.scrollVelocityY /= 1.1;
  }
  if(this.scrollVelocityY > -0.05 && this.scrollVelocityY < 0.05) {
    this.scrollVelocityY = 0;
  }
};

// preRender = function() {};

// render = function() {};

SectorState.prototype.resize = function(width, height) {
  this.space && this.space.resize(width, height);
  this.snow && this.snow.resize(width, height);
};

// paused = function() {};

// resumed = function() {};

// pauseUpdate = function() {};

SectorState.prototype.shutdown = function() {
  this.selection.destroy();
};

module.exports = SectorState;
