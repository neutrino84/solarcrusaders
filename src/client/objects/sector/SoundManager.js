
var engine = require('engine');

function SoundManager(game) {
  this.game = game;

  // listen to player
  this.game.on('ship/player', this._player, this);
  
  this.game.on('ship/enhancement/started', this.generateEnhancementSound, this);

};

SoundManager.prototype.constructor = SoundManager;

SoundManager.MINIMUM_VOLUME = 0.1;

SoundManager.prototype.init = function() {
  //..
};

SoundManager.prototype.preload = function() {
  var game = this.game,
      load = game.load;

  load.audio('background1', 'sounds/background_music/eerie1.mp3');
  load.audio('background2', 'sounds/background_music/eerie2.mp3');
  load.audio('background3', 'sounds/background_music/Spacetheme1.mp3');    

  load.audio('pulse-basic', 'sounds/pulses/basic.mp3');
  load.audio('pulse-quantum', 'sounds/pulses/quantum.mp3');
  load.audio('pulse-tarkin', 'sounds/pulses/tarkin.mp3');
  load.audio('pulse-bazuko', 'sounds/pulses/bazuko.mp3');

  // load.audio('plasma-basic', 'sounds/plasmas/basic.mp3');
  // load.audio('laser-basic', 'sounds/lasers/basic.mp3');
  // load.audio('laser-light', 'sounds/lasers/light.mp3');
  load.audio('beam-repair', 'sounds/beamWeapons/repairBeams/beam-repair.mp3');

  load.audio('beam-harvester1','sounds/beamWeapons/scavBeams/hrvstr1.mp3');
  load.audio('beam-harvester2','sounds/beamWeapons/scavBeams/hrvstr2.mp3');
  load.audio('beam-harvester3','sounds/beamWeapons/scavBeams/hrvstr3.mp3');
  load.audio('beam-harvester4','sounds/beamWeapons/scavBeams/hrvstr4.mp3');
  load.audio('beam-harvester5','sounds/beamWeapons/scavBeams/hrvstr5.mp3');

  load.audio('beam-disintegrator','sounds/beamWeapons/scavBeams/Disintegrator1.1.mp3');

  load.audio('beam-basic','sounds/beamWeapons/ubadianBeams/capitalBeam.mp3');

  // load.audio('damage-a', 'sounds/explosions/damage-a.mp3');
  // load.audio('damage-b', 'sounds/explosions/damage-b.mp3');
  // load.audio('explosion-a', 'sounds/explosions/explosion-a.mp3');
  load.audio('heal-basic', 'sounds/enhancements/heal-basic.mp3');
  load.audio('booster-basic', 'sounds/enhancements/booster-basic.mp3');
  load.audio('shield-basic', 'sounds/enhancements/shield-basic.mp3');
  load.audio('piercing-basic', 'sounds/enhancements/piercing-basic.mp3');
  load.audio('detect', 'sounds/enhancements/detect.mp3');
  load.audio('detectClosest','sounds/squadCallbacks/detectClosest.mp3');

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

  load.audio('squadshipDeath','sounds/explosions/squadShipExplosion3.mp3');
  load.audio('shieldUp','sounds/squadSounds/shieldUpBetterStill.mp3');

  load.audio('queenDeath','sounds/explosions/queenDeath.mp3');
  load.audio('overseerDeath','sounds/explosions/overseerDeath3.mp3');
  load.audio('harvesterDeath1','sounds/explosions/collectorDeath.mp3');
  load.audio('harvesterDeath2','sounds/explosions/larvaDeath.mp3');

  load.audio('growl1','sounds/thrusters/scavThrusters/scavThrust1.mp3');
  load.audio('growl2','sounds/thrusters/scavThrusters/scavThrust2.mp3');
  load.audio('growl3','sounds/thrusters/scavThrusters/scavThrust3.mp3');

  load.audio('dangerAlert','sounds/misc/lowHealthDangerSFX.mp3');

  load.audio('queenSpawn','sounds/misc/queenSpawn.mp3');

  // SYSTEM
  load.audio('systems-online', 'sounds/system/systemsOnline.mp3');
  load.audio('sensors-online', 'sounds/system/sensorsOnline.mp3');
  load.audio('weapons-systems-online', 'sounds/system/weaponsSystemsOnline.mp3');
  load.audio('reactor-online', 'sounds/system/reactorOnline.mp3');
  load.audio('repairs-completed', 'sounds/system/repairsCompleted.mp3');



  //SQUAD CALLBACKS
  load.audio('copyThatCommander','sounds/squadCallbacks/copyThatCommander.mp3');
  load.audio('copyThatCommander2','sounds/squadCallbacks/copyThatCommander2.mp3');

  load.audio('engagingTarget','sounds/squadCallbacks/engagingTarget.mp3');
  load.audio('targetEngaged','sounds/squadCallbacks/targetEngaged.mp3');

  load.audio('headsUpWereTakingFire','sounds/squadCallbacks/headsUpWereTakingFire.mp3');
  load.audio('returningToFormation','sounds/squadCallbacks/returningToFormation.mp3');
  load.audio('standby','sounds/squadCallbacks/standby.mp3');

  load.audio('ShieldMaidenInbound','sounds/squadCallbacks/ShieldMaidenInbound.mp3');
  load.audio('ShieldMaidenOnline','sounds/squadCallbacks/ShieldMaidenOnline.mp3');

  //SELECTION
  load.audio('selectionSFX1', 'sounds/misc/selectionSFX1.mp3');
  load.audio('selectionSFX2', 'sounds/misc/selectionSFX2_echo.mp3');


  this.game.on('shipyard/hover', this._selection, this);
  
};

SoundManager.prototype.create = function() {
  this.manager = this.game.states.current;
  this.shipManager = this.manager.shipManager;
  this.ships = this.shipManager.ships;
  this.config = this.game.cache.getJSON('item-configuration', false);


  this.game.on('shipyard/hover', this._selection, this);

  // generate sound pools
  this.game.sound.add('pulse-basic', 6);
  this.game.sound.add('pulse-quantum', 6);
  this.game.sound.add('pulse-tarkin', 6);
  this.game.sound.add('pulse-bazuko', 6);
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
   this.game.sound.add('detect', 2);
   this.game.sound.add('detectClosest', 2);


  

  this.game.sound.add('background1', 1);
  this.game.sound.add('background2', 1);
  this.game.sound.add('background3', 1);

  this.game.sound.add('beam-disintegrator', 6)

  // this.game.sound.add('beam-harvester', 1);
  this.game.sound.add('beam-harvester1', 1);
  this.game.sound.add('beam-harvester2', 1);
  this.game.sound.add('beam-harvester3', 1);
  this.game.sound.add('beam-harvester4', 1);
  this.game.sound.add('beam-harvester5', 1);
  
  this.game.sound.add('beam-basic', 4);

  this.game.sound.add('explosion-a', 6);
  this.game.sound.add('explosion-b', 6);
  this.game.sound.add('explosion-c', 6);
  this.game.sound.add('explosion-d', 6);
  this.game.sound.add('explosion-e', 6);
  this.game.sound.add('explosion-f', 6);

  this.game.sound.add('capital-explosion-a', 6);
  this.game.sound.add('capital-explosion-b', 6);
  this.game.sound.add('capital-explosion-c', 6);

  this.game.sound.add('squadshipDeath', 2);
  this.game.sound.add('shieldUp', 2);

  this.game.sound.add('dangerAlert', 1);

  this.game.sound.add('queenSpawn', 1);
  this.game.sound.add('queenDeath', 1);
  this.game.sound.add('overseerDeath', 1);
  this.game.sound.add('harvesterDeath1', 1);
  this.game.sound.add('harvesterDeath2', 1);
  this.game.sound.add('growl1', 1);
  this.game.sound.add('growl2', 1);
  this.game.sound.add('growl3', 1);

  this.game.sound.add('systems-online', 1);
  this.game.sound.add('reactor-online', 1);
  this.game.sound.add('sensors-online', 1);
  this.game.sound.add('weapons-systems-online', 1);
  this.game.sound.add('repairs-completed', 1);

  this.game.sound.add('copyThatCommander', 1);
  this.game.sound.add('copyThatCommander2', 1);
  this.game.sound.add('engagingTarget', 1);
  this.game.sound.add('targetEngaged', 1);
  this.game.sound.add('returningToFormation', 1);
  this.game.sound.add('standby', 1);
  this.game.sound.add('headsUpWereTakingFire', 1);
  this.game.sound.add('ShieldMaidenInbound', 1);
  this.game.sound.add('ShieldMaidenOnline', 1);

  // subscribe to events
  this.game.on('ship/enhancement/started', this._enhance, this);
  this.game.on('ship/sound/growl', this.generateQueenGrowl, this);
  this.game.on('ship/disabled', this._disabled, this);
  this.game.on('ship/hardpoint/fire', this._fire, this);
  this.game.on('ship/hardpoint/hit', this._hit, this);
  this.game.on('system/sound', this.generateSystemSound, this);
  this.game.on('ship/secondary', this.generateThrusterSound, this);
  this.game.on('global/sound/spawn', this.generateSpawnSound, this);

  this.game.on('squad/sound', this.generateSquadSound, this);
  this.game.on('squad/shieldDestination', this.generateSquadSound, this);
  this.game.on('squad/shieldDestinationDeactivate', this.generateSquadSound, this);
};

SoundManager.prototype._selection = function(sound){
  this.game.sound.play(sound, 0.2, false);
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
      sound, distance, num;
  if(ship) {
    if(player === ship) {
      sound = explosion;
    } else if(player && player !== ship) {
      distance = engine.Point.distance(ship, player);
      volume = global.Math.max(1-(distance/8192), 0);
      volume *= volume;
      sound = explosion;

      if(ship.data.chassis === 'scavenger-x04'){
        sound = 'queenDeath';
      };
      if(ship.data.chassis === 'scavenger-x03'){
        sound = 'overseerDeath';
      };
      if(ship.data.chassis === 'squad-shield' || ship.data.chassis === 'squad-attack' || ship.data.chassis === 'squad-repair'){
        sound = 'squadshipDeath';
      };
      if(ship.data.chassis === 'scavenger-x02' || ship.data.chassis === 'scavenger-x01'){
        num = Math.floor((Math.random() * 2)+1);
        sound = 'harvesterDeath' + num;
      };
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
      harvesterNum = Math.floor((Math.random() * 5)+1), 
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
        // }
        volume *= launcher.data.volume;
        variation = launcher.data.variation;

        if(sound) {
          
          v = rnd.realInRange(volume/8.0, volume/2.0);
          r = rnd.realInRange(1.0-variation, 1.0+variation);

          if(sound === 'beam-harvester'){
          sound = 'beam-harvester'+harvesterNum
          }
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
  var num = Math.floor((Math.random() * 3)+1);
  this.game.sound.play('background'+num, 0.6, true);
  // console.log('music is background'+num)
};

SoundManager.prototype.generateThrusterSound = function(){
  var num = Math.floor((Math.random() * 3)+1);
  this.game.sound.play('thruster'+num, 0.5, false);
};

SoundManager.prototype.generateEnhancementSound = function(data){
  if(!this.config){
    return
  };
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
  if(!player || !ship){return}
  if(player.x && ship && player !== ship) { 
    distance = engine.Point.distance(ship, player);    
    volume = global.Math.max(sound.volume - (distance / 2000), 0);
  };
  if(volume > 0){
      this.game.sound.play(sound.name, volume, false);
  };
};

SoundManager.prototype.generateQueenGrowl = function(ship){
  var num = Math.floor((Math.random() * 3)+1),
      player = this.player,
      distance, volume;
  if(player) {   
    distance = engine.Point.distance(ship, player);    
    volume = global.Math.max(1.4 - (distance / 2000), 0);
  };
  if(volume > 0){
    // this.generateSound('growl'+num, volume, false);
    this.game.sound.play('growl'+num, volume, false);
  };

  ship.events.loop(4000, growlTimer = function(){
    var num = Math.floor((Math.random() * 3)+1),
        player = this.player;
    if(player) {   
      distance = engine.Point.distance(ship, player);    
      volume = global.Math.max(1.4 - (distance / 2000), 0);
    };
    if(volume > 0){
      this.game.sound.play('growl'+num, volume, false);
    };  
  }, this);
};

SoundManager.prototype.generateSquadSound = function(sound){
  var volume = 0.25,
      num;
      switch(sound) {
        case 'engage':
          num = Math.floor((Math.random() * 2)+1)
          volume = 0.185;
          if(num === 2){
            this.game.sound.play('engagingTarget', volume, false);
          } else if (num === 1){
            this.game.sound.play('targetEngaged', volume, false);
          }
          break
        case 'regroup':
          num = Math.floor((Math.random() * 3))
          if(num){
            this.game.sound.play('returningToFormation', volume, false);
          }
          break;
        case 'closestHostile':
            this.game.sound.play('detectClosest', volume, false);
          break;
        case 'shieldUp':
          num = Math.floor((Math.random() * 3))
          // if(num){

            this.game.sound.play('shieldUp', volume, false);
          // }
          break;
        case 'shieldDestination':
            // this.game.sound.play('shieldDestination', volume, false);
          break;
        case 'shieldDestinationDeactivate':
            // this.game.sound.play('shieldDestination', volume, false);
          break;
        default:
          break;
      }
};

SoundManager.prototype.generateSpawnSound = function(data){
  this.game.sound.play(data, 0.2, false);
  this.game.camera.shake(5000);
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
  };
  if(player && player !== ship) {   
    distance = engine.Point.distance(ship, player);    
    volume = global.Math.max(1 - (distance / 5000), 0);
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