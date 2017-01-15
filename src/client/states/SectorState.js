var engine = require('engine'),
    Space = require('../fx/Space'),
    Planet = require('../fx/Planet'),
    NebulaCluster = require('../fx/NebulaCluster'),
    // ShockwaveManager = require('../fx/ShockwaveManager'),
    Snow = require('../fx/Snow'),
    InputManager = require('../objects/sector/InputManager'),
    ShipManager = require('../objects/sector/ShipManager'),
    SoundManager = require('../objects/sector/SoundManager')
    StationManager = require('../objects/sector/StationManager'),
    Asteroid = require('../objects/sector/misc/Asteroid');
function SectorState() {}

SectorState.prototype = Object.create(engine.State.prototype);
SectorState.prototype.constructor = engine.State;

SectorState.prototype.init = function(args) {
  global.state = this;

  this.scrollLock = true;
  this.game.stage.disableVisibilityChange = true;
  this.soundManager = SoundManager.prototype
};

SectorState.prototype.preload = function() {
  var load = this.game.load;

  // load background
  load.image('space', 'imgs/game/space/sector-a.jpg');
  load.image('nebula', 'imgs/game/space/nebula-a.jpg');
  load.image('snow', 'imgs/game/space/snow.jpg');

  // load.image('draghe', 'imgs/game/planets/draghe.jpg');
  // load.image('eamon', 'imgs/game/planets/eamon-alpha.jpg');
  // load.image('arkon', 'imgs/game/planets/arkon.jpg');
  load.image('planet', 'imgs/game/planets/eamon-alpha.jpg');
  load.image('clouds', 'imgs/game/planets/clouds.jpg');

  // load stations
  load.image('station', 'imgs/game/stations/ubaidian-x01.png');
  load.image('station-cap', 'imgs/game/stations/ubaidian-cap-x01.png');

  load.image('laser-blue', 'imgs/game/fx/laser-blue.png');
  load.image('laser-red', 'imgs/game/fx/laser-red.png');
  // load.image('trails', 'imgs/game/fx/trails.png');

  SoundManager.prototype.preload()


  // this.SoundManager.preload()
  // test load sound
  // load.audio('background', 'imgs/game/sounds/mood.mp3');

  // load.audio('laser1','imgs/game/sounds/lasers/laser1.mp3');
  //  load.audio('laser2','imgs/game/sounds/lasers/laser2.mp3');
  //   load.audio('laser3','imgs/game/sounds/lasers/laser3.mp3');
  //    load.audio('laser4','imgs/game/sounds/lasers/laser4.mp3');
  //     load.audio('laser5','imgs/game/sounds/lasers/laser5.1.mp3');
  //      load.audio('laser6','imgs/game/sounds/lasers/laser6.1.mp3');
  //       load.audio('laser7','imgs/game/sounds/lasers/laser7.1.mp3');
  //        load.audio('laser8','imgs/game/sounds/lasers/laser8.1.mp3');
  //         load.audio('laser9','imgs/game/sounds/lasers/laser9.1.mp3');
  //          load.audio('laser10','imgs/game/sounds/lasers/laser10.1.mp3');
  //           load.audio('laser11','imgs/game/sounds/lasers/laser11.1.mp3');
  //            load.audio('laser12','imgs/game/sounds/lasers/laser12.1.mp3');
  //             load.audio('laser13','imgs/game/sounds/lasers/laser13.1.mp3');
  //              load.audio('laser14','imgs/game/sounds/lasers/laser14.1.mp3');
  //               load.audio('laser15','imgs/game/sounds/lasers/laser15.1.mp3');
  //                load.audio('laser16','imgs/game/sounds/lasers/laser16.1.mp3');
  //                 load.audio('laser17','imgs/game/sounds/lasers/laser17.1.mp3');
  // load.audio('heavyLaser1','imgs/game/sounds/lasers/heavyLasers1.mp3');
  // load.audio('heavyLaser2','imgs/game/sounds/lasers/heavyLasers2.mp3');
  // load.audio('heavyLaser3','imgs/game/sounds/lasers/heavyLasers3.mp3');
  // load.audio('heavyLaser4','imgs/game/sounds/lasers/heavyLasers4.mp3');
  // load.audio('heavyLaser5','imgs/game/sounds/lasers/heavyLasers5.mp3');
  // load.audio('heavyLaser6','imgs/game/sounds/lasers/heavyLasers6.mp3');
  // load.audio('heavyLaser7','imgs/game/sounds/lasers/heavyLasers7.mp3');


  // load.audio('rocket1','imgs/game/sounds/rockets/rocket1.mp3');
  // load.audio('rocket2','imgs/game/sounds/rockets/rocket2.mp3');
  // load.audio('rocket3','imgs/game/sounds/rockets/rocket3.mp3');

  // load.audio('mediumThrusters1','imgs/game/sounds/thrusters/mediumThrusters1.mp3');
  // load.audio('mediumThrusters2','imgs/game/sounds/thrusters/mediumThrusters2.mp3');
  // load.audio('mediumThrusters3','imgs/game/sounds/thrusters/mediumThrusters3.mp3');

  // load.audio('heavyThrusters1','imgs/game/sounds/thrusters/heavy/heavyThrusters1.7.mp3');
  // load.audio('heavyThrusters2','imgs/game/sounds/thrusters/heavy/heavyThrusters2.7.mp3');
  // load.audio('heavyOverdrive','imgs/game/sounds/thrusters/heavy/heavyOverdrive.mp3');


  // load.audio('shieldsUp','imgs/game/sounds/shields/shieldsUp1.mp3');
  // load.audio('heavyShieldsUp','imgs/game/sounds/shields/heavyShieldsUp.mp3');

  // load.audio('piercingDamageActivate','imgs/game/sounds/piercingDamage/piercingDamageActivate.mp3');
  // load.audio('repair1','imgs/game/sounds/repair/HealthUp1.mp3')
  // load.audio('deathExplosion','imgs/game/sounds/deathExplosion/deathExplosion.mp3')

  // load.audio('blip1','imgs/game/sounds/selectionSFX/selectionSFX1_converted.mp3');
  // load.audio('blip2','imgs/game/sounds/selectionSFX/selectionSFX2_converted.mp3');

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
  this.game.world.scale.set(0.54, 0.54);

  this.game.camera.bounds = null;
  this.game.camera.focusOnXY(2048, 2048);

  // create sector
  this.createManagers();
  // this.createAsteroids();
  this.createSpace();
  // this.createSnow();

  // AUDIO TEST


  this.background = this.game.sound.add('background', 0, true);
  // this.heavyThrusters = this.game.sound.add('heavyThrusters', 0, true);
  

  this.background.on('decoded', function() {
    this.play('', 0, 0.5, true);
    this.fadeTo(12000, 0.01);
  });


  // start zoom in
  this.game.once('ship/follow', function() {
    this.zoom = this.game.tweens.create(this.game.world.scale);
    this.zoom.to({ x: 0.28, y: 0.28 }, 3000, engine.Easing.Quadratic.InOut, true);
  }, this);

  // login
  if(game.auth.ready) {
    this.game.gui.login(game.auth.user);
  }

  // initialize net manager
  this.game.shipNetManager.init();

  // this.game.soundManager.init();


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
  this.nebula.position.set(-512, 1024);
  this.nebula.create(3);

  this.game.world.static.add(this.space);
  this.game.world.foreground.add(this.nebula);
  this.game.world.background.add(this.planet);
};

SectorState.prototype.createManagers = function() {
  // this.shockwaveManager = new ShockwaveManager(this.game, this);

  this.stationManager = new StationManager(this.game);
  this.stationManager.boot();
  
  this.shipManager = new ShipManager(this.game);

  this.soundManager = new SoundManager(this.game)

  this.inputManager = new InputManager(this.game);
};

SectorState.prototype.createSnow = function() {
  this.snow = new Snow(this.game, this.game.width, this.game.height);
  this.game.stage.addChild(this.snow);
  this.game.stage.swapChildren(this.snow, this.game.gui.root);
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
      amount = 512;

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
