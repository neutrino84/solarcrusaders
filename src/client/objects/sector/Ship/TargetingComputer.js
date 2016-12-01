
var engine = require('engine'),
    Hardpoint = require('../Hardpoint');

function TargetingComputer(parent, config) {
  this.parent = parent;
  this.game = parent.game;
  this.config = config;

  this.hardpoints = [];
  this.enhancements = {};

  this.target = new engine.Point();

  // attack rate locked at
  // 500ms but will be dynamic
  this.fire = this.game.clock.throttle(this.fired, 500, this, true);

  this.piercingDamageActivate = this.game.sound.add(('piercingDamageActivate'),0,true)



  this.laserArr = []
  this.heavyLaserArr = []
  this.rocketArr = []

  for(var i = 1; i<18; i++){
    this.laserArr.push(this.game.sound.add(('laser'+i),0,true));
  }

  for(var i = 1;i<7;i++){
    this.heavyLaserArr.push(this.game.sound.add(('heavyLaser'+i),0,true));
  }
  for(var i = 1;i<4;i++){
    this.rocketArr.push(this.game.sound.add(('rocket'+i),0,true));
  }
};

TargetingComputer.prototype.constructor = TargetingComputer;

TargetingComputer.prototype.create = function() {
  var hardpoint, config, data, slot,
      parent = this.parent,
      hardpoints = parent.details.hardpoints;
  for(var h in hardpoints) {
    slot = hardpoints[h].slot;

    hardpoint = new Hardpoint(this, hardpoints[h], this.config.hardpoints[slot]);
    hardpoint.fxGroup = parent.manager.fxGroup;
    hardpoint.flashEmitter = parent.manager.flashEmitter;
    hardpoint.explosionEmitter = parent.manager.explosionEmitter;
    hardpoint.glowEmitter = parent.manager.glowEmitter;
    hardpoint.fireEmitter = parent.manager.fireEmitter;

    this.hardpoints.push(hardpoint);
  }
};

TargetingComputer.prototype.attack = function(target) {
  var hardpoints = this.hardpoints,
      parent = this.parent,
      length = hardpoints.length,
      distance,distanceSound;

  if(length > 0) {
    // update target
    this.target.set(target.x, target.y);

    // distance
    distance = engine.Point.distance(parent.position, this.target);
    // display
    
    weapon = this.parent.details.hardpoints[0].type
    if(distance>=700){
      distanceSound = 0.1
    } else if(distance < 7 && distance >=300){
      distanceSound = 0.1
    } else if(distance < 300 && distance >= 100){
      distanceSound = 0.2
    } else {
      distanceSound = 0.3
    }
    if(weapon === 'laser'){
      var maxNum = this.laserArr.length-1
      var minNum = 0

      var randomNum = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
      var randomNum2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

      if(randomNum > 10){
        this.laserArr[randomNum].play('', 0, distanceSound, false);
        this.laserArr[randomNum2].play('', 0, distanceSound, false);
      }
      else {
      this.laserArr[randomNum].play('', 0, distanceSound, false);      
      }
      
    } else if (weapon === 'rocket'){
      var maxNum = this.rocketArr.length-1
      var minNum = 0
      var randomNum = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
      this.rocketArr[randomNum].play('', 0, distanceSound, false);
    }

    for(var i=0; i<length; i++) {
      hardpoints[i].fire(distance);
    }
  }
};

TargetingComputer.prototype.fired = function(target) {
  console.log('I fired!')
    // consile.log(this.game)
  var game = this.game,
      parent = this.parent,
      hardpoints = this.hardpoints,
      socket = parent.manager.socket,
      details = parent.details,
      distance,
      closeOrFar;
  if(hardpoints.length > 0) {
    game.world.worldTransform.applyInverse(target, this.target);
    distance = engine.Point.distance(parent.position, this.target);
     
    // server
    socket.emit('ship/attack', {
      uuid: parent.uuid,
      targ: {
        x: this.target.x,
        y: this.target.y
      }
    });

    // display
    for(var i=0; i<hardpoints.length; i++) {
      hardpoints[i].fire(distance);
    }
  }
};

TargetingComputer.prototype.enhance = function(name, state) {
  // console.log('Targeting Computer state is: ',state)
  this.enhancements[name] = state;
  // console.log('TargetingComputer.enhance()')
  if(state === true){
  this.piercingDamageActivate.play('', 0, 0.1, false);
  }
  else{
    //play piercingDamageDeActivateSFX
  }
};

TargetingComputer.prototype.enhanced = function(name) {
  return this.enhancements[name];
};

TargetingComputer.prototype.update = function() {
  var hardpoints = this.hardpoints,
      length = hardpoints.length;
  if(length > 0) {
    for(var h in hardpoints) {
      hardpoints[h].update();
    }
  }
};

TargetingComputer.prototype.destroy = function() {
  var hardpoint,
      hardpoints = this.hardpoints;
  
  for(var h in hardpoints) {
    hardpoint = hardpoints[h];
    hardpoint.destroy();
    hardpoint.fxGroup =
      hardpoint.flashEmitter =
      hardpoint.explosionEmitter =
      hardpoint.glowEmitter = undefined;
  }
  
  this.parent = this.game =
    this.config = this.hardpoints = undefined;
};

module.exports = TargetingComputer;
