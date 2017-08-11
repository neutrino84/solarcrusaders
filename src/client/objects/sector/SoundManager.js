
var engine = require('engine');

function SoundManager(game) {
  this.game = game;

  // listen to player
  this.game.on('ship/player', this._player, this);
  this.game.on('ship/secondary', this.generateThrusterSound, this);
};

SoundManager.prototype.constructor = SoundManager;

SoundManager.MINIMUM_VOLUME = 0.2;

SoundManager.prototype.init = function() {
  //..
};

SoundManager.prototype.preload = function() {
  var game = this.game,
      load = game.load;

      console.log('soundmanager preload')

  load.audio('pulse-basic', 'sounds/pulses/basic.mp3');
  // load.audio('pulse-nucleon', 'sounds/pulses/nucleon.mp3');
  // load.audio('pulse-vulcan', 'sounds/pulses/vulcan.mp3');
  // load.audio('plasma-basic', 'sounds/plasmas/basic.mp3');
  // load.audio('laser-basic', 'sounds/lasers/basic.mp3');
  // load.audio('laser-light', 'sounds/lasers/light.mp3');

  // load.audio('booster-basic', 'sounds/enhancements/booster-basic.mp3');
  // load.audio('shield-basic', 'sounds/enhancements/shield-basic.mp3');

  // load.audio('damage-a', 'sounds/explosions/damage-a.mp3');
  // load.audio('damage-b', 'sounds/explosions/damage-b.mp3');
  // load.audio('explosion-a', 'sounds/explosions/explosion-a.mp3');

  load.audio('thruster1', 'sounds/thrusters/medium1.mp3');
  load.audio('thruster2', 'sounds/thrusters/medium2.mp3');
  load.audio('thruster3', 'sounds/thrusters/medium3.mp3');

  load.audio('systemsOnline', 'sounds/system/systemsOnline.mp3');
};

SoundManager.prototype.create = function() {
  this.manager = this.game.states.current;
  this.shipManager = this.manager.shipManager;
  this.ships = this.shipManager.ships;
  this.config = this.game.cache.getJSON('item-configuration', false);

  // generate sound pools
  this.game.sound.add('pulse-basic', 6);
  // this.game.sound.add('pulse-nucleon', 6);
  // this.game.sound.add('pulse-vulcan', 6);
  // this.game.sound.add('plasma-basic', 6);
  // this.game.sound.add('laser-basic', 6);
  // this.game.sound.add('laser-light', 6);

  // this.game.sound.add('booster-basic', 2);
  // this.game.sound.add('shield-basic', 2);

  // this.game.sound.add('damage-a', 3);
  // this.game.sound.add('damage-b', 3);
  // this.game.sound.add('explosion-a', 2);

  this.game.sound.add('thruster1', 6);
  this.game.sound.add('thruster2', 6);
  this.game.sound.add('thruster3', 6);

  this.game.sound.add('systemsOnline', 1);

  // subscribe to events
  this.game.on('ship/enhancement/started', this._enhance, this);
  this.game.on('ship/disabled', this._disabled, this);
  this.game.on('ship/hardpoint/fire', this._fire, this);
  this.game.on('ship/hardpoint/hit', this._hit, this);
  this.game.on('system/sound', this.generateSystemSound, this);
};

SoundManager.prototype._enhance = function(data) {
  var game = this.game,
      player = this.player || { x: 2048, y: 2048 },
      ship = this.ships[data.uuid],
      enhancements = this.config.enhancement,
      enhancement = data.enhancement,
      subtype = data.subtype,
      sound = enhancements[enhancement][subtype].sound,
      volume;
  if(sound && ship) {
    volume = sound.volume;

    if(player !== ship) {   
      distance = engine.Point.distance(ship, player);
      volume = global.Math.max(1-(distance/2048), 0);
      volume *= sound.volume;
    }
  }
  if(volume > SoundManager.MINIMUM_VOLUME) {
    this.game.sound.play(sound.name, volume, false); 
  }
};

SoundManager.prototype._hit = function(data) {
  var game = this.game,
      player = this.player || { x: 2048, y: 2048 },
      target = data.target,
      ship = data.ship,
      explosion = game.rnd.pick(['damage-a', 'damage-b']),
      distance = engine.Point.distance(target, player),
      volume = global.Math.max(1-(distance/8192), 0),
      v, r;
  if(volume > SoundManager.MINIMUM_VOLUME) {
    v = game.rnd.realInRange(volume/6, volume/2),
    r = game.rnd.realInRange(0.8, 1.6);

    game.sound.play(explosion, v, false, r);
  }
};

SoundManager.prototype._disabled = function(data) {
  var game = this.game,
      player = this.player || { x: 2048, y: 2048 },
      ship = this.ships[data.uuid],
      volume = 0.5,
      rnd = game.rnd,
      explosion = rnd.pick(['explosion-a']),
      sound, distance;
  if(ship) {
    if(player === ship) {
      sound = explosion;
    } else if(player && player !== ship) {
      distance = engine.Point.distance(ship, player);
      volume = global.Math.max(1-(distance/8192), 0);
      volume *= volume;
      sound = explosion;
    }
    if(sound && volume > SoundManager.MINIMUM_VOLUME) {
      game.sound.play(sound, volume, false, rnd.realInRange(0.8, 1.2));
    }
  }
};

SoundManager.prototype._fire = function(data) {
  var created = data.created,
      game = this.game,
      player = this.player || { x: 2048, y: 2048 },
      rnd = game.rnd,
      ship = data.ship,
      launcher, sound, 
      volume = 0.0,
      v, r;

  if(data.spawn>0) {
    distance = engine.Point.distance(ship, player);
    volume = global.Math.max(1-(distance/8192), 0);

    if(volume > SoundManager.MINIMUM_VOLUME) {
      // smooth distance
      volume *= volume;

      for(var i=0; i<created.length; i++) {
        // thin out and apply sound
        launcher = created[i];
        sound = launcher.data.sound;
        volume *= launcher.data.volume;
        variation = launcher.data.variation;

        if(sound) {
          v = rnd.realInRange(volume/8.0, volume/2.0);
          r = rnd.realInRange(1.0-variation, 1.0+variation);

          // each spawn gets a slightly different volume
          game.clock.events.create(launcher.delay, false, data.spawn,
            function(key, volume, rate) {
              this.game.sound.play(key, volume, false, rate, false);
            }, this, [sound, v, r]
          );
        }
      }
    }
  }
};

SoundManager.prototype.generateSystemSound = function(sound){
  this.game.sound.play(sound, 0.3, false);
};

SoundManager.prototype.generateThrusterSound = function(){
  var num = Math.floor((Math.random() * 3)+1);
  // console.log(num)
  // if(num<4){
    // this.generateSound('thruster'+num, 1, false); 
    this.game.sound.play('thruster'+num, 0.7, false);
    // this.game.sound.play('thruster1', 1, false);
    // this.game.sound.play('pulse-basic', 2, false);
  // }
};

SoundManager.prototype._player = function(ship){
  this.player = ship;
  this.game.clock.events.create(1100, false, 1, function(){
    this.generateSystemSound('systemsOnline')
  }, this)
};

module.exports = SoundManager;