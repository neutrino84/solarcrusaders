var engine = require('engine'),
    pixi = require('pixi'),
    UI = require('../ui'),
    NetManager = require('../net/NetManager'),
    Space = require('../fx/Space'),
    Planet = require('../fx/Planet'),
    NebulaCluster = require('../fx/NebulaCluster'),
    Snow = require('../fx/Snow'),
    MiniMap = require('../fx/MiniMap'),
    LossState = require('./LossState'),
    InputManager = require('../objects/sector/InputManager'),
    ShipManager = require('../objects/sector/ShipManager'),
    PlayerManager = require('../objects/sector/PlayerManager'),
    StationManager = require('../objects/sector/StationManager'),
    SquadManager = require('../objects/sector/SquadManager'),
    ObjectManager = require('../objects/sector/ObjectManager'),
    TutorialManager = require('../objects/sector/TutorialManager'),
    UserManager = require('../objects/sector/UserManager'),
    SoundManager = require('../objects/sector/SoundManager'),
    HotkeyManager = require('../objects/sector/HotkeyManager'),
    Asteroid = require('../objects/sector/misc/Asteroid');
    
function SectorState(game) {
  this.game = game;
  this.auth = game.auth;

  
  this.game.on('user/shipSelected', this.playerCreated, this);
  this.game.on('user/shipSelected/tutorial', this.playerCreated, this);
  this.game.on('game/loss', this.switchState, this);
  this.game.on('game/win', this.switchState, this);
  this.game.on('game/transition', this.switchState, this);

  this.scaleX = 1.5;
  this.scaleY = 1.5;
};

SectorState.prototype = Object.create(engine.State.prototype);
SectorState.prototype.constructor = engine.State;

SectorState.prototype.init = function(args) {
  this.ui = new UI(this.game);

  this.soundManager = new SoundManager(this.game);

  this.scrollLock = true;
//^ does this prevent scrolling

  this.game.stage.disableVisibilityChange = true;
};

SectorState.prototype.preload = function() {
  // preload ui and sound manager
  this.ui.preload();
  this.soundManager.preload();



  // var planets = [
  // 'daigus',
  // 'eamon-alpha',
  // 'modo',
  // 'ichor',
  // 'talus',
  // 'arkon'
  // ]

  var planets = [
  'arkon'
  ]


  this.planetTexture = this.game.rnd.pick(planets);
  // load background
  // if(!this.game.states.firstIteration){
    this.game.load.image('space', 'imgs/game/space/sector-a.jpg');
    this.game.load.image('nebula', 'imgs/game/space/nebula-a.jpg');
    this.game.load.image('snow', 'imgs/game/space/snow.jpg');

    this.game.load.image('planet', ('imgs/game/planets/' + this.planetTexture + '.jpg'));
    this.game.load.image('clouds', 'imgs/game/planets/clouds.jpg');

    // load stations
    this.game.load.image('ubadian-station-x01', 'imgs/game/stations/stations_enlarged/ubaidian-x01.png');
    this.game.load.image('ubadian-station-x01-cap', 'imgs/game/stations/stations_enlarged/ubaidian-cap-x01.png');
    this.game.load.image('scavenger-x01', 'imgs/game/stations/stations_enlarged/scavenger-x01.png');
    this.game.load.image('scavenger-x01-cap', 'imgs/game/stations/stations_enlarged/scavenger-x01.png');
    this.game.load.image('general-station-x01', 'imgs/game/stations/stations_enlarged/general-x01.png');
    this.game.load.image('general-station-x01-cap', 'imgs/game/stations/stations_enlarged/general-cap-x01.png');

    this.game.load.image('tutorial-platform', 'imgs/game/stations/tutorial-platform.png');
    this.game.load.image('tutorial-platform-cap', 'imgs/game/stations/tutorial-platform-cap.png');

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
  // };
    // load texture atlas
    this.game.load.atlasJSONHash('texture-atlas', 'imgs/game/texture-atlas.png', 'data/texture-atlas.json');

    // load ship configuration
    this.game.load.json('ship-configuration', 'data/ship-configuration.json');
    this.game.load.json('item-configuration', 'data/item-configuration.json');
    this.game.load.json('station-configuration', 'data/station-configuration.json');
    this.game.states.firstIteration = true;
}


// loadUpdate = function() {};
// loadRender = function() {};

SectorState.prototype.create = function() {
  var sensitivity = 1000,
      mouse = this.game.input.mouse;
      mouse.capture = true;
      mouse.mouseWheelCallback = function(event) {
        var delta = event.deltaY / sensitivity,
            scale = engine.Math.clamp(this.game.world.scale.x - delta, 0.5, 1.0);
            // scale = engine.Math.clamp(this.world.scale.x - delta, 0.5, 1.0);
        if(this.game.paused) { return; }
        if(this.zoom && this.zoom.isRunning) {
          return;
        }
        this.game.world.scale.set(scale, scale);
      }.bind(this);

      // var lossState = new LossState(this.game);

      // this.game.states.add('loss', lossState);
      // this.game.states.start('loss');

  // set world
  this.game.world.size(0, 0, 4096, 4096);
 
  if(this.game.auth.user && this.game.auth.user.ship){
    this.game.world.scale.set(0.8, 0.8);
    this.ui.create();
    this.createManagers(); 
  } else {
    this.game.world.scale.set(1.5, 1.5);
    this.game.camera.focus(2048, 2048); 
    // this.game.camera.focus(16000, 16000); 
    this.ui.create();
  }

  // create sector
  this.createAsteroids();
  this.createSpace();
  this.createSnow();
    // this.game.world.scale.set(.6, .6);

  // create ui

  // shipyard selection SFX
  this.game.sound.add('selectionSFX1', 2);
  this.game.sound.add('selectionSFX2', 1);
};

SectorState.prototype.playerCreated = function(tutorial){
    var game = this.game;


    this.createManagers('firstIteration');

    if(tutorial){
      this.game.emit('map/off');
      this.tutorialManager = new TutorialManager(this.game, this);

      
      // this.game.emit('map/off');
      // this.game.emit('blob')
    };
    this.zoom = this.game.tweens.create(this.game.world.scale);
    this.zoom.to({ x: 0.8, y: 0.8 }, 5000, engine.Easing.Quadratic.InOut);
    this.zoom.delay(1500);
    this.zoom.start();
    this.zoom.on('complete', function() {
      this.scrollLock = false;
    }, this);
};

SectorState.prototype.createSpace = function() {
  this.space = new Space(this.game);
  this.space.cache();

  this.planet = new Planet(this.game, this.planetTexture);

  this.snow = new Snow(this.game, this.game.width, this.game.height);


  this.nebula = new NebulaCluster(this.game);
  this.nebula.position.set(1024 - 128, 1024 - 128);
  this.nebula.create(12, 0.00006, 0.0, [0.9, 0.3, 0.3]);

  this.neb1 = new NebulaCluster(this.game);
  this.neb1.position.set(256, 256);
  this.neb1.create(4, 0.00034, 512, [0.0, 1, 0.0]);

  this.neb2 = new NebulaCluster(this.game);
  this.neb2.position.set(128, 128);
  this.neb2.create(4, 0.00034, 256, [1.0, 0.8, 0.2]);

  this.neb3 = new NebulaCluster(this.game);
  this.neb3.position.set(528, 528);
  this.neb3.create(4, 0.001, 256, [0.1, 0.3, 1]);

  this.game.world.static.add(this.space);
  this.game.world.static.add(this.snow);
  this.game.world.background.add(this.nebula);
  this.game.world.background.add(this.planet);
  this.game.world.add(this.neb1);
  this.game.world.add(this.neb2);
  this.game.world.add(this.neb3);
};

SectorState.prototype.createManagers = function(first) {
  var game = this.game;

  this.netManager = new NetManager(game, this);
  this.inputManager = new InputManager(game, this);
  this.hotkeyManager = new HotkeyManager(game, this);
  this.stationManager = new StationManager(game, this);
  if(first){
    this.shipManager = new ShipManager(game, this, first);
  } else {
    this.shipManager = new ShipManager(game, this);
  }
  this.objManager = new ObjectManager(game);
  this.playerManager = new PlayerManager(game);
  this.squadManager = new SquadManager(game, this);
  this.soundManager.create();
  this.game.emit('game/backgroundmusic')

  this.squadManager.create(this);
  this.hotkeyManager.create(this);
};

SectorState.prototype.createSnow = function() {
  this.snow = new Snow(this.game, this.game.width, this.game.height);
  this.game.world.front.add(this.snow);
};

SectorState.prototype.createAsteroids = function() {
  var game = this.game,
      steroid,
      amount = 164;
  for(var i=0; i<amount; i++) {
    asteroid = new Asteroid(this.game);
    asteroid.position.set(3048 / 4, 3048 / 4);

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
SectorState.prototype.switchState = function(outcome) {
  this.soundManager.destroy();

  if(outcome === 'transition'){
    this.game.clock.events.add(3000, function(){
      this.game.states.start('transition')
    }, this);
  } else if(outcome === 'loss'){
    this.game.clock.events.add(3000, function(){
      this.game.states.start('loss')
    }, this); 
  } else {
    this.game.clock.events.add(3000, function(){
      this.game.states.start('win')
    }, this); 
  };
}

SectorState.prototype.shutdown = function() {
  //.. properly destroy

this.shipManager.destroy();
this.stationManager.destroy();
this.squadManager.destroy();
this.netManager.destroy();
this.tutorialManager && this.tutorialManager.destroy()
this.ui.destroy();

 this.stationManager = this.space = this.ui =
 this.planet = this.nebula = this.neb1 = this.neb2 = this.neb3 = this.hotkeyManager
 = this.shipManager = this.netManager = this.soundManager = undefined

};

module.exports = SectorState;
