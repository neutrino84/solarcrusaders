
var engine = require('engine'),
    Ship = require('./Ship'),
    EnhancementManager = require('./EnhancementManager'),
    ExplosionEmitter = require('./emitters/ExplosionEmitter'),
    FlashEmitter = require('./emitters/FlashEmitter'),
    GlowEmitter = require('./emitters/GlowEmitter'),
    ShockwaveEmitter = require('./emitters/ShockwaveEmitter'),
    FireEmitter = require('./emitters/FireEmitter'),
    Indicator = require('./misc/Indicator');
    // SectorState = require('../states/SectorState')

function ShipManager(game) {

  this.game = game;
  this.clock = game.clock;
  this.net = game.net;
  this.socket = game.net.socket;
  this.shipNetManager = game.shipNetManager;
  this.enhancementManager = new EnhancementManager(this);

  // player
  // this.player = null;

  //this is my attempt at making a player object I can understand/use -Richard
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
  // this.mediumThrusters = this.game.sound.add(('heavyThrusters'),0,true)
  // ship cache
  this.ships = {};

  // create indicator
  this.indicator = new Indicator(game);

  // create containers
  this.shipsGroup = new engine.Group(game);
  this.fxGroup = new engine.Group(game);
  this.trajectoryGroup = new engine.Group(game);

  // create emitters
  this.explosionEmitter = new ExplosionEmitter(this.game);
  this.flashEmitter = new FlashEmitter(this.game);
  this.glowEmitter = new GlowEmitter(this.game);
  this.shockwaveEmitter = new ShockwaveEmitter(this.game);
  this.fireEmitter = new FireEmitter(this.game);

  this.game.particles.add(this.explosionEmitter);
  this.game.particles.add(this.flashEmitter);
  this.game.particles.add(this.glowEmitter);
  this.game.particles.add(this.shockwaveEmitter);
  this.game.particles.add(this.fireEmitter);

  // add ships to world
  this.game.world.add(this.trajectoryGroup);
  this.game.world.add(this.flashEmitter);
  this.game.world.add(this.shipsGroup);
  this.game.world.add(this.fxGroup);
  this.game.world.add(this.fireEmitter);
  this.game.world.add(this.explosionEmitter);
  this.game.world.add(this.shockwaveEmitter);
  this.game.world.add(this.glowEmitter);
  this.game.world.add(this.indicator);

  this.trajectoryGraphics = new engine.Graphics(game);
  this.trajectoryGroup.addChild(this.trajectoryGraphics);

  // authentication
  this.game.auth.on('disconnected', this._pause, this);

  // networking
  // TODO: move to ShipNetManager... maybe not?
  this.socket.on('ship/sync', this._syncBind = this._sync.bind(this));
  this.socket.on('ship/attack', this.attackBind = this._attack.bind(this));

  // subscribe to messages
  this.game.on('game/pause', this._pause, this);
  this.game.on('game/resume', this._resume, this);

  this.game.on('ship/player', this._player, this);
  this.game.on('ship/primary', this._primary, this);
  this.game.on('ship/secondary', this._secondary, this);
  this.game.on('ship/follow', this._follow, this);
  this.game.on('ship/unfollow', this._unfollow, this);
  this.game.on('ship/removed', this._removed, this);
  this.game.on('ship/disabled', this._disabled, this);
  this.game.on('ship/enabled', this._enabled, this);
};

ShipManager.prototype.constructor = ShipManager;

// ShipManager.prototype.focus = function() {
//   this.game.input.on('keydown', this._unfollow, this);
// };

// ShipManager.prototype.blur = function() {
//   this.game.input.removeListener('keydown', this._unfollow);
// };

ShipManager.prototype.create = function(data, details) {
  var game = this.game,
      container = this.shipsGroup,
      ship = new Ship(this, details.chassis);

  ship.uuid = data.uuid;
  ship.user = details.user;
  ship.username = details.username;
  ship.details = details;
  ship.position.set(data.pos.x, data.pos.y);

  // display
  container.add(ship);

  // boot
  ship.boot();

  return ship;
};

ShipManager.prototype.remove = function(data) {
  var game = this.game,
      camera = game.camera,
      ships = this.ships,
      ship = ships[data.uuid];
  if(ship !== undefined) {
    if(camera.target === ship) {
      camera.unfollow();
    }
    ship.destroy();
    delete ships[ship.uuid];
  }
};

ShipManager.prototype.removeAll = function() {
  var ships = this.ships;
  for(var s in ships) {
    this.remove(ships[s]);
  }
};

ShipManager.prototype.destroy = function() {
  var game = this.game,
      auth = this.game.auth,
      socket = this.socket;

  auth.removeListener('disconnected', this._pause);

  socket.removeListener('ship/sync', this._syncBind);
  socket.removeListener('ship/attack', this._attackBind);

  game.removeListener('ship/player', this._player);
  game.removeListener('ship/primary', this._primary);
  game.removeListener('ship/secondary', this._secondary);
  game.removeListener('ship/follow', this._follow);
  game.removeListener('ship/removed', this._removed);
  game.removeListener('ship/disabled', this._disabled);
  game.removeListener('ship/enabled', this._enabled);
  game.removeListener('game/pause', this._pause);
  game.removeListener('game/resume', this._resume);

  game.particles.remove(this.explosionEmitter);
  game.particles.remove(this.flashEmitter);
  game.particles.remove(this.glowEmitter);
  game.particles.remove(this.shockwaveEmitter);

  game.world.remove(this.trajectoryGroup);
  game.world.remove(this.shockwaveEmitter);
  game.world.remove(this.shipsGroup);
  game.world.remove(this.fxGroup);
  game.world.remove(this.explosionEmitter);
  game.world.remove(this.flashEmitter);
  game.world.remove(this.glowEmitter);

  this.game = this.socket = this._syncBind =
   this._attackBind = undefined;

  this.removeAll();
};

ShipManager.prototype._sync = function(data) {
  var ship, cached,
      game = this.game,
      ships = data.ships,
      length = ships.length,
      details, created, distance;
  for(var s=0; s<length; s++) {
    ship = ships[s];
    details = this.shipNetManager.getShipData(ship.uuid);

    if(details) {
      created = !this.ships[ship.uuid];
      cached = created ? this.ships[ship.uuid] = this.create(ship, details) : this.ships[ship.uuid];
      cached.movement.plot(ship);

      // this.trajectoryGraphics.lineStyle(0);
      // this.trajectoryGraphics.beginFill(0x0000FF, 0.5);
      // this.trajectoryGraphics.drawCircle(ship.pos.x, ship.pos.y, 6);
      // this.trajectoryGraphics.endFill();
    }
  }
};

ShipManager.prototype._player = function(ship) {
  this.player = ship;
  // var hasLaser = false;
  // for (var prop in ship.details.cargo){
  //   var item = ship.details.cargo[prop].sprite
  //   if(item === 'item-laser-a'){
  //     hasLaser=true
  //     this.player.details.weapon = 'laser'
  //     this.game.playerObj.weapon = 'laser'
  //   } else {this.player.details.weapon = 'rocket', this.game.playerObj.weapon = 'rocket'}
  // }
  this.game.playerObj.name = ship.name
  // console.log(this.game.playerObj.name)
};

ShipManager.prototype.laserFireSFX = function(shipSize){
  console.log('SHOT LASER')
  if(shipSize === 'light'){
  var maxNum = this.laserArr.length-1
  var minNum = 0

  var randomNum = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
  this.laserArr[randomNum].play('', 0, 0.3, false);
  // console.log(this.laserArr[randomNum])
  }
  if(shipSize === 'heavy'){
  var maxNum = this.heavyLaserArr.length-1
  var minNum = 0
  var randomNum = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
  var randomNum2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
  this.heavyLaserArr[randomNum].play('', 0, 0.1, false);
  this.heavyLaserArr[randomNum2].play('', 0, 0.1, false);
  }
}
ShipManager.prototype.rocketFireSFX = function(){
  console.log('SHOT ROCKKET')
  var maxNum = this.rocketArr.length-1
  var minNum = 0
  var randomNum = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
  this.rocketArr[randomNum].play('', 0, 0.3, false);
  console.log(this.rocketArr[randomNum])
}

ShipManager.prototype.thrustersSFX = function(shipSize){
  if(shipSize === 'light'){
    var maxNum = this.thrustersArr.length-1
    var minNum = 0
    var randomNum = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    this.thrustersArr[randomNum].play('', 0, 0.7, false);
  }
  if(shipSize === 'heavy'){
    var maxNum = this.heavyThrustersArr.length-1
    var minNum = 0
    var randomNum = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    this.heavyThrustersArr[randomNum].play('', 0, 0.4, false);
  }
}


ShipManager.prototype._attack = function(data) {
  var ship = this.ships[data.uuid];

  if(ship != this.player) {
    ship.targetingComputer.attack(data.targ);
  }
  else {
    if(this.ships[data.uuid].details.hardpoints[0].type === 'rocket'){
      this.rocketFireSFX(0.1)
    }
    if(this.ships[data.uuid].details.hardpoints[0].type === 'laser' && this.game.playerObj.name === 'ubaidian-x02' || this.ships[data.uuid].details.hardpoints[0].type === 'laser' && this.game.playerObj.name === 'ubaidian-x01'){
      this.laserFireSFX('heavy')  
    }
    else if(this.ships[data.uuid].details.hardpoints[0].type === 'laser'){
      this.laserFireSFX('light')    
    } 
  }
};

ShipManager.prototype._primary = function(data) {
  var clock = this.clock,
      ship = this.player,
      input = this.game.input;
  if(ship) {
    if(!ship.disabled && data.type === 'start') {
      this.autofire && clock.events.remove(this.autofire);
      this.autofire = clock.events.loop(50, function() {
        ship.targetingComputer.fire({
          x: input.mousePointer.x,
          y: input.mousePointer.y
        });
      });
    } else {
      this.autofire && clock.events.remove(this.autofire);
    }
  }
};
ShipManager.prototype.timerOn = false

ShipManager.prototype.timer = function(){
  if(this.timerOn === false){
    ShipManager.prototype.timerOn = true
    setTimeout(function(){
      ShipManager.prototype.timerOn = false
    }, 4500)
  }
}

ShipManager.prototype._secondary = function(data) {
  var game = this.game,
      ship = this.player,
      socket = this.socket,
      indicator = this.indicator,
      end = this.game.input.mousePointer,
      start = this.shipsGroup.worldTransform.apply(ship.position),
      position = this.game.world.worldTransform.applyInverse(end),
      destination = { x: end.x - start.x, y: end.y - start.y };
  if(ship) {
    if(data.type === 'start') {
      indicator.show(position);

      if(this.timerOn === false){
        if(this.game.playerObj.name === 'ubaidian-x02'){this.thrustersSFX('heavy')}
        else{this.thrustersSFX('light')}
      }  
      this.timer()
      


      socket.emit('ship/plot', {
        uuid: ship.uuid,
        destination: destination
      });
    }
  }
};

ShipManager.prototype._follow = function(ship) {
  if(ship.position) {
    this.game.camera.follow(ship);
  }
};

ShipManager.prototype._unfollow = function() {
  this.game.camera.unfollow();
};

ShipManager.prototype._disabled = function(data) {
  var ship = this.ships[data.uuid],
      clock = this.clock;
  if(ship !== undefined) {
    ship.disable();

    // cancel autofire
    if(ship.isPlayer) {
      this.autofire && clock.events.remove(this.autofire);
    }
  }
};

ShipManager.prototype._enabled = function(data) {
  var ship = this.ships[data.uuid];
  if(ship !== undefined) {
    ship.enable();
  }
};

ShipManager.prototype._removed = function(ship) {
  var tween,
      game = this.game,
      s = this.ships[ship.uuid];
  if(s !== undefined) {
    this.remove(ship);
  }
};

ShipManager.prototype._resume = function() {
  //..
};

ShipManager.prototype._pause = function() {
  this.removeAll();
};

module.exports = ShipManager;
