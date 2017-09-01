
var engine = require('engine');

function SoundManager(game) {
  this.game = game;

  // listen to player
  this.game.on('ship/player', this._player, this);
  
  this.game.on('ship/enhancement/started', this.generateEnhancementSound, this);
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

  load.audio('background1', 'sounds/background_music/eerie1.mp3');
  load.audio('background2', 'sounds/background_music/eerie2.mp3');
  load.audio('background3', 'sounds/background_music/Spacetheme1.mp3');    

  load.audio('pulse-basic', 'sounds/pulses/basic.mp3');
  // load.audio('pulse-nucleon', 'sounds/pulses/nucleon.mp3');
  // load.audio('pulse-vulcan', 'sounds/pulses/vulcan.mp3');
  // load.audio('plasma-basic', 'sounds/plasmas/basic.mp3');
  // load.audio('laser-basic', 'sounds/lasers/basic.mp3');
  // load.audio('laser-light', 'sounds/lasers/light.mp3');
  load.audio('beam-repair', 'sounds/beamWeapons/repairBeams/beam-repair.mp3');

  // load.audio('booster-basic', 'sounds/enhancements/booster-basic.mp3');
  // load.audio('shield-basic', 'sounds/enhancements/shield-basic.mp3');

  // load.audio('damage-a', 'sounds/explosions/damage-a.mp3');
  // load.audio('damage-b', 'sounds/explosions/damage-b.mp3');
  // load.audio('explosion-a', 'sounds/explosions/explosion-a.mp3');
  load.audio('heal-basic', 'sounds/enhancements/heal-basic.mp3');
  load.audio('booster-basic', 'sounds/enhancements/booster-basic.mp3');
  load.audio('shield-basic', 'sounds/enhancements/shield-basic.mp3');
  load.audio('piercing-basic', 'sounds/enhancements/piercing-basic.mp3');

  load.audio('thruster1', 'sounds/thrusters/medium1.mp3');
  load.audio('thruster2', 'sounds/thrusters/medium2.mp3');
  load.audio('thruster3', 'sounds/thrusters/medium3.mp3');

  // EXPLOSIONS
  load.audio('explosion-a','sounds/explosions/explosion_new_1.mp3');
  load.audio('explosion-b','sounds/explosions/explosion_new_2.mp3');
  load.audio('explosion-c','sounds/explosions/explosion_new_3.mp3');
  load.audio('explosion-d','sounds/explosions/explosion_new_3.pitched2.mp3');
  load.audio('explosion-e','sounds/explosions/explosion_new_3.pitched3.mp3');
  load.audio('explosion-f','sounds/explosions/explosion_new_3.rerepitched.mp3');

  load.audio('capital-explosion-a','sounds/explosions/deathExplosion.mp3');
  load.audio('capital-explosion-b','sounds/explosions/actionExplosion.mp3');
  load.audio('capital-explosion-c','sounds/explosions/explosionBig100.mp3');

  load.audio('queenDeath','sounds/explosions/queenDeath.mp3');
  load.audio('overseerDeath','sounds/explosions/overseerDeath3.mp3');
  load.audio('harvesterDeath1','sounds/explosions/collectorDeath.mp3');
  load.audio('harvesterDeath2','sounds/explosions/larvaDeath.mp3');

  load.audio('dangerAlert','sounds/misc/lowHealthDangerSFX.mp3');

  load.audio('queenSpawn','sounds/misc/queenSpawn.mp3');

  // SYSTEM
  load.audio('systems-online', 'sounds/system/systemsOnline.mp3');
  load.audio('sensors-online', 'sounds/system/sensorsOnline.mp3');
  load.audio('weapons-systems-online', 'sounds/system/weaponsSystemsOnline.mp3');
  load.audio('reactor-online', 'sounds/system/reactorOnline.mp3');
  load.audio('repairs-completed', 'sounds/system/repairsCompleted.mp3');

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

  this.game.sound.add('beam-repair', 6);

  // this.game.sound.add('booster-basic', 2);
  // this.game.sound.add('shield-basic', 2);

  // this.game.sound.add('damage-a', 3);
  // this.game.sound.add('damage-b', 3);
  // this.game.sound.add('explosion-a', 2);

  this.game.sound.add('thruster1', 6);
  this.game.sound.add('thruster2', 6);
  this.game.sound.add('thruster3', 6);

   this.game.sound.add('heal-basic', 3);
   this.game.sound.add('booster-basic', 3);
   this.game.sound.add('shield-basic', 3);
   this.game.sound.add('piercing-basic', 3);

  

  this.game.sound.add('background1', 1);
  this.game.sound.add('background2', 1);
  this.game.sound.add('background3', 1);


  this.game.sound.add('explosion-a', 6);
  this.game.sound.add('explosion-b', 6);
  this.game.sound.add('explosion-c', 6);
  this.game.sound.add('explosion-d', 6);
  this.game.sound.add('explosion-e', 6);
  this.game.sound.add('explosion-f', 6);

  this.game.sound.add('capital-explosion-a', 6);
  this.game.sound.add('capital-explosion-b', 6);
  this.game.sound.add('capital-explosion-c', 6);

  this.game.sound.add('dangerAlert', 1);

  this.game.sound.add('queenSpawn', 1);

  this.game.sound.add('systems-online', 1);
  this.game.sound.add('reactor-online', 1);
  this.game.sound.add('sensors-online', 1);
  this.game.sound.add('weapons-systems-online', 1);
  this.game.sound.add('repairs-completed', 1);

  // subscribe to events
  this.game.on('ship/enhancement/started', this._enhance, this);
  this.game.on('ship/disabled', this._disabled, this);
  this.game.on('ship/hardpoint/fire', this._fire, this);
  this.game.on('ship/hardpoint/hit', this._hit, this);
  this.game.on('system/sound', this.generateSystemSound, this);
  this.game.on('ship/secondary', this.generateThrusterSound, this);
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
      explosion = rnd.pick(['explosion-a','explosion-b','explosion-c','explosion-d', 'explosion-e','explosion-f']),
      bigExplosion = rnd.pick(['capital-explosion-a','capital-explosion-b','capital-explosion-c']),
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
  var systemSFX = ['reactor-online','sensors-online','weapons-systems-online','repairs-completed']
  if(sound){
    this.game.sound.play(sound, 0.2, false);
  } else {
    this.game.sound.play(this.game.rnd.pick(systemSFX), 0.2, false)
  }
};

SoundManager.prototype.generateBackgroundMusic = function(){
  var num = Math.floor((Math.random() * 2)+1);
  console.log('background'+num)
  this.game.sound.play('background'+num, 0.8, false);
};

SoundManager.prototype.generateThrusterSound = function(){
  var num = Math.floor((Math.random() * 3)+1);
  
  this.game.sound.play('thruster'+num, 0.5, false);
};

SoundManager.prototype.generateEnhancementSound = function(data){
  if(!this.config){
    return
  };
  // console.log(data)
  var enhancements = this.config.enhancement,
      enhancement = data.enhancement,
      subtype = data.subtype,
      sound = enhancements[enhancement][subtype].sound,
      volume = sound.volume,
      player = this.player,
      manager = this.shipManager,
      ship = this.ships[data.uuid],
      distance = 0.1,
      num = Math.floor((Math.random() * 3)+1);

  if(player && ship && player !== ship) {   
    distance = engine.Point.distance(ship, player);    
    volume = global.Math.max(sound.volume - (distance / 2000), 0);
  };
  if(volume > 0){
      this.game.sound.play(sound.name, volume, false);
  };
};

SoundManager.prototype.generateExplosionSound = function(data){
  var explosionsArray = ['explosion2','explosion3','explosion4','explosion5','explosion6'],
      bigExplosionsArray = ['capitalShipExplosion','capitalShipExplosion2','capitalShipExplosion3'],
      player = this.player,
      ship = data,
      volume = 0.3,
      bigExplosion = bigExplosionsArray[Math.floor(Math.random() * bigExplosionsArray.length)],
      smallExplosion = explosionsArray[Math.floor(Math.random() * explosionsArray.length)],
      num = Math.floor((Math.random() * 2)+1),
      sound, distance;
      
  if(player && player === ship){
    sound = bigExplosion;
    volume = 0.75;
    console.log(sound)
  };
  if(player && player !== ship) {   
    distance = engine.Point.distance(ship, player);    
    volume = global.Math.max(1 - (distance / 5000), 0);
    console.log(data.data.size)
    if(data.data.size >= 64) {
      sound = bigExplosion
      if(volume >.6){volume = .6}
      if(sound === 'capitalShipExplosion' && volume > 0.2){
        volume = 0.2
      };
    
    } else {sound = smallExplosion};
    if(data.data.chassis === 'scavengers-x04d'){
      sound = 'queenDeath';
    };
    if(data.data.chassis === 'scavengers-x03c'){
      sound = 'overseerDeath';
      volume = global.Math.max(0.85 - (distance / 5000), 0);
    };
    if(data.data.chassis === 'scavengers-x02' || data.data.chassis === 'scavengers-x01'){
      sound = 'harvesterDeath' + num;
      volume = global.Math.max(0.7 - (distance / 5000), 0);
    };
  }; 
  if(volume > 0){
    this.game.sound.play(sound, volume, false);
  };
};

SoundManager.prototype._player = function(ship){
  this.player = ship;

  this.game.clock.events.create(1100, false, 1, function(){
    this.generateBackgroundMusic();
    this.generateSystemSound('systems-online')
  }, this)
};

module.exports = SoundManager;