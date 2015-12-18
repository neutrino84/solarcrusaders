var engine = require('engine'),
    Background = require('../fx/Background'), // this should draw from objects/sector
    Planet = require('../fx/Planet'), // this should draw from /objects/sector/planet
    ShipManager = require('../objects/sector/ShipManager');
    
function SectorState() {}

SectorState.prototype = Object.create(engine.State.prototype);
SectorState.prototype.constructor = engine.State;

SectorState.prototype.init = function(args) {
  global.state = this;

  this.ships = [];
  
  this.scrollVelocityX = 0;
  this.scrollVelocityY = 0;

  this.scrollLock = false;
};

SectorState.prototype.preload = function() {
  var load = this.game.load;

  // load background
  load.image('space', 'imgs/game/space/sector-a.jpg');

  // load.image('draghe', 'imgs/game/planets/draghe.jpg');
  // load.image('eamon', 'imgs/game/planets/eamon-alpha.jpg');
  load.image('eamon', 'imgs/game/planets/daimus.jpg');
  load.image('clouds', 'imgs/game/planets/clouds.jpg');

  load.image('laser-red', 'imgs/game/fx/laser-red.png');
  load.image('laser-blue', 'imgs/game/fx/laser-blue.png');
  // load.image('engine-glow', 'imgs/game/fx/engine-glow.png');
  // load.image('engine-smoke', 'imgs/game/fx/engine-smoke.png');
  // load.image('explosion-a', 'imgs/game/fx/explosion-a.png');
  // load.image('explosion-b', 'imgs/game/fx/explosion-b.png');
  // load.image('explosion-c', 'imgs/game/fx/explosion-c.png');
  // load.image('explosion-d', 'imgs/game/fx/explosion-d.png');
  // load.image('explosion-flash', 'imgs/game/fx/explosion-flash.png');
  // load.image('damage-a', 'imgs/game/fx/damage-a.png');

  // load.image('station-mining', 'imgs/game/stations/station-mining.png');

  // test load sound
  load.audio('background', 'imgs/game/sounds/mood.mp3');

  // load tilemap
  // load.image('sector', 'imgs/game/tilesets/sector.png');
  // load.tilemap('sector', 'data/sector.json');

  // load fx atlas
  this.game.load.atlasJSONHash('fx-atlas', 'imgs/game/fx/fx-atlas.png', 'data/fx-atlas.json');
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
            scale = engine.Math.clamp(this.world.scale.x - delta, 0.25, 1.2);//,
            // gridLayer = global.state.gridLayer;

        // stop zoom
        if(self.zoom && self.zoom.isRunning) {
          self.zoom.stop();
        }

        this.world.scale.set(scale, scale);
        
        // show/hide sector grid
        // if(scale >= 1.0) {
        //   gridLayer.visible = true;
        // } else {
        //   gridLayer.visible = false;
        // }
      };

  // store gui reference
  this.gui = game.state.getBackgroundState('gui');

  this.game.world.setBounds(0, 0, 4096, 4096);
  this.game.world.scale.set(0.25, 0.25);

  this.game.camera.bounds = null;
  this.game.camera.focusOnXY(2048, 2048);

  // create sector
  // this.createGrid();
  this.createSector();
  this.createManagers();

  // AUDIO TEST
  this.sound = this.game.sound.add('background', 0.5, true);
  this.sound.on('decoded', function() {
    this.fadeIn(12000, true);
  });

  // start zoom in
  this.zoom = this.game.tweens.create(this.game.world.scale);
  this.zoom.to({ x: 1.0, y: 1.0 }, 8000, engine.Easing.Quadratic.InOut, true);

  // gui
  this.gui.toggle(true);
  this.game.emit('gui/message', 'daimus alpha', 500, 1500);
};

// SectorState.prototype.createGrid = function() {
//   this.grid = new engine.Tilemap(this.game, 'sector');
//   this.grid.addTilesetImage('sector');
//   this.gridLayer = this.grid.createLayer('grid', this.game.width, this.game.height);
//   // this.gridLayer.visible = false;
// };

SectorState.prototype.createSector = function() {
  this.background = new Background(this.game, this.game.width, this.game.height);
  
  this.planet = new Planet(this.game, 'eamon');
  this.planet.position.set(0, 0);
  
  this.game.world.background.add(this.planet);
  this.game.stage.addChildAt(this.background, 0);
};

SectorState.prototype.createManagers = function() {
  this.shipManager = new ShipManager(this.game);
  this.shipManager.hudGroup = this.gui.hud;
};

SectorState.prototype.update = function() {
  var game = this.game,
      camera = game.camera,
      keyboard = game.input.keyboard,
      // fix this :(
      // timeStep = this.game.clock.elapsedMS / 1000,
      move = 1.04;// * timeStep;

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
  camera.view.x -= this.scrollVelocityX;
  camera.view.y -= this.scrollVelocityY;
  
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
  this.background && this.background.resize(width, height);
  // this.gridLayer && this.gridLayer.resize(width, height);
};

// paused = function() {};

// resumed = function() {};

// pauseUpdate = function() {};

SectorState.prototype.shutdown = function() {
  this.stage.removeChild(this.background);
  this.background && this.background.destroy();
  // this.gridLayer && this.gridLayer.destroy();
};

module.exports = SectorState;
