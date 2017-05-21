var engine = require('engine'),
    Ship = require('./Ship'),
    EnhancementManager = require('./EnhancementManager'),
    ExplosionEmitter = require('./emitters/ExplosionEmitter'),
    FlashEmitter = require('./emitters/FlashEmitter'),
    GlowEmitter = require('./emitters/GlowEmitter'),
    ShockwaveEmitter = require('./emitters/ShockwaveEmitter'),
    FireEmitter = require('./emitters/FireEmitter'),
    Indicator = require('./misc/Indicator');


function SoundManager(game) {
  this.game = game;
  this.clock = game.clock;
  this.net = game.net;
  this.socket = game.net.socket;
  // this.enhancementManager = new EnhancementManager(this);

  this.game.soundManager = this

  this.game.playerObj = {};
  this.player = this.game.playerObj

  this.laserArr = []
  this.heavyLaserArr = []
  this.rocketArr = []
  this.thrustersArr = []
  this.heavyThrustersArr = []

  for(var i = 1; i<18; i++){
    this.laserArr.push(this.game.sound.add(('laser'+i),0,true));
  }
  for(var i = 1;i<4;i++){
    this.rocketArr.push(this.game.sound.add(('rocket'+i),0,true));
  }
  for(var i = 1;i<4;i++){
    this.thrustersArr.push(this.game.sound.add(('mediumThrusters'+i),0,true));
  }
  for(var i = 1;i<3;i++){
    this.heavyThrustersArr.push(this.game.sound.add(('heavyThrusters'+i),0,true));
  }
  for(var i = 1;i<7;i++){
    this.heavyLaserArr.push(this.game.sound.add(('heavyLaser'+i),0,true));
  }

  this.repair = this.game.sound.add(('repair'),0,true)
  this.shieldsUpSFX = this.game.sound.add(('shieldsUp'),0,true)
  this.heavyShieldsUpSFX = this.game.sound.add(('heavyShieldsUp'),0,true)
  this.piercingDamageActivate = this.game.sound.add(('piercingDamageActivate'),0,true)
  this.deathExplosion = this.game.sound.add(('deathExplosion'),0,true);
  this.dangerWarning = this.game.sound.add(('dangerWarning'),0,true);

  this.game.on('ship/damaged', this.damaged, this);

  this.dangerAlert = false
}

SoundManager.prototype.constructor = SoundManager;

SoundManager.prototype.preload = function() {
  this.game = game;
  var load = this.game.load;

  

  
  // load sound
  console.log('loading sounds')
  load.audio('background', 'imgs/game/sounds/mood.mp3');

  load.audio('laser1','imgs/game/sounds/lasers/laser1.mp3');
   load.audio('laser2','imgs/game/sounds/lasers/laser2.mp3');
    load.audio('laser3','imgs/game/sounds/lasers/laser3.mp3');
     load.audio('laser4','imgs/game/sounds/lasers/laser4.mp3');
      load.audio('laser5','imgs/game/sounds/lasers/laser5.1.mp3');
       load.audio('laser6','imgs/game/sounds/lasers/laser6.1.mp3');
        load.audio('laser7','imgs/game/sounds/lasers/laser7.1.mp3');
         load.audio('laser8','imgs/game/sounds/lasers/laser8.1.mp3');
          load.audio('laser9','imgs/game/sounds/lasers/laser9.1.mp3');
           load.audio('laser10','imgs/game/sounds/lasers/laser10.1.mp3');
            load.audio('laser11','imgs/game/sounds/lasers/laser11.1.mp3');
             load.audio('laser12','imgs/game/sounds/lasers/laser12.1.mp3');
              load.audio('laser13','imgs/game/sounds/lasers/laser13.1.mp3');
               load.audio('laser14','imgs/game/sounds/lasers/laser14.1.mp3');
                load.audio('laser15','imgs/game/sounds/lasers/laser15.1.mp3');
                 load.audio('laser16','imgs/game/sounds/lasers/laser16.1.mp3');
                  load.audio('laser17','imgs/game/sounds/lasers/laser17.1.mp3');
  load.audio('heavyLaser1','imgs/game/sounds/lasers/heavyLasers1.mp3');
  load.audio('heavyLaser2','imgs/game/sounds/lasers/heavyLasers2.mp3');
  load.audio('heavyLaser3','imgs/game/sounds/lasers/heavyLasers3.mp3');
  load.audio('heavyLaser4','imgs/game/sounds/lasers/heavyLasers4.mp3');
  load.audio('heavyLaser5','imgs/game/sounds/lasers/heavyLasers5.mp3');
  load.audio('heavyLaser6','imgs/game/sounds/lasers/heavyLasers6.mp3');
  load.audio('heavyLaser7','imgs/game/sounds/lasers/heavyLasers7.mp3');


  load.audio('rocket1','imgs/game/sounds/rockets/rocket1.mp3');
  load.audio('rocket2','imgs/game/sounds/rockets/rocket2.mp3');
  load.audio('rocket3','imgs/game/sounds/rockets/rocket3.mp3');

  load.audio('mediumThrusters1','imgs/game/sounds/thrusters/mediumThrusters1.mp3');
  load.audio('mediumThrusters2','imgs/game/sounds/thrusters/mediumThrusters2.mp3');
  load.audio('mediumThrusters3','imgs/game/sounds/thrusters/mediumThrusters3.mp3');

  load.audio('heavyThrusters1','imgs/game/sounds/thrusters/heavy/heavyThrusters1.7.mp3');
  load.audio('heavyThrusters2','imgs/game/sounds/thrusters/heavy/heavyThrusters2.7.mp3');
  load.audio('heavyOverdrive','imgs/game/sounds/thrusters/heavy/heavyOverdrive.mp3');


  load.audio('shieldsUp','imgs/game/sounds/shields/shieldsUp1.mp3');
  load.audio('heavyShieldsUp','imgs/game/sounds/shields/heavyShieldsUp.mp3');

  load.audio('piercingDamageActivate','imgs/game/sounds/piercingDamage/piercingDamageActivate.mp3');
  load.audio('repair','imgs/game/sounds/repair/HealthUp1.mp3')
  load.audio('deathExplosion','imgs/game/sounds/deathExplosion/deathExplosion.mp3')

  load.audio('blip1','imgs/game/sounds/selectionSFX/selectionSFX1_converted.mp3');
  load.audio('blip2','imgs/game/sounds/selectionSFX/selectionSFX2_converted.mp3');

  load.audio('dangerWarning','imgs/game/sounds/misc/deathExplosion.mp3');

  load.audio('piratesTarget','imgs/game/sounds/misc/deathExplosion.mp3')
};

SoundManager.prototype.damaged = function(e) {
  if(e < .33 && this.dangerAlert === false){
    console.log('30% DAMAGE REACHED!')
    this.dangerAlert = true
    this.dangerWarning.play('', 0, 0.5, false)
  }
  if(e > .6 && this.dangerAlert === true){
    this.dangerAlert = false
  }
  // this.game.on('ship/damaged')
};

module.exports = SoundManager;