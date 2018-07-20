
var engine = require('engine'),
    Movement = require('../Movement'),
    Repair = require('./Repair'),
    EngineCore = require('./EngineCore'),
    TargetingComputer = require('./TargetingComputer'),
    ShieldGenerator = require('./ShieldGenerator'),
    Explosion = require('./Explosion'),
    Damage = require('./Damage'),
    Selector = require('./Selector'),
    Hud = require('../../../ui/components/Hud');

function Ship(manager, data) {
  engine.Sprite.call(this, manager.game, 'texture-atlas', data.chassis + '.png');

  this.name = data.name;
  this.manager = manager;
  this.data = data;
  
  // config data
  this.config = data.config.ship;

  // layer chassis
  this.chassis = new engine.Sprite(manager.game, 'texture-atlas', data.chassis + '.png');

  // defaults
  this.rotation = data.rotation 
  this.shielded = false;
  if(this.data.user){
    this.docked = true;
  } else {
    this.docked = false;
  };

  // + global.Math.PI;
  this.pivot.set(this.width/2, this.height/2);

  // timer events
  this.events = new engine.Timer(this.game, false);

  // core ship classes
  this.hud = new Hud(this);
  this.movement = new Movement(this);
  this.damage = new Damage(this);
  this.engineCore = new EngineCore(this, this.config.engine);
  this.targetingComputer = new TargetingComputer(this, this.config.targeting);
  this.shieldGenerator = new ShieldGenerator(this, this.config.shields);
  this.repair = new Repair(this);
  this.explosion = new Explosion(this);
  this.selector = new Selector(this);
};

Ship.prototype = Object.create(engine.Sprite.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.boot = function() {
  // add chassis
  this.addChild(this.chassis);



  // create main systems
  this.engineCore.create();
  this.targetingComputer.create();
  this.shieldGenerator.create();
  this.repair.create();
  this.hud.create();
  this.damage.create();
  this.explosion.create();
  this.selector.create();

  // subscribe to updates
  this.data.on('data', this.refresh, this);

  // start events
  this.events.start();

  // set disabled
  this.data.disabled && this.disable();

  // set player
  if(this.isPlayer) {
    this.game.emit('ship/player', this);
  }
};

Ship.prototype.refresh = function(data) {
  if(!this.manager){return}
  var ship, attacker, defender,
      damage = this.damage,
      ships = this.manager.ships,
      targetingComputer = this.targetingComputer;

  if(data.killed && this.isPlayer){
    console.log('SHIP INDEX SENDING CREDIT GAIN to HUD, this.hud is ', this.hud);
    ships[data.killed].hud.showCreditLoss(data.gains);
    
    this.hud.showCreditGain(data.gains, data.killed)
  }

  if(data.credits && this.isPlayer){
    this.game.emit('player/credits');
    if(data.creditsLost){
      this.hud.showCreditLoss(data.creditsLost);
    }
  };

  if(data.shielded ){
    this.shielded = true;
    this.shieldGenerator.startShieldField();
  } 
  else if(this.shielded){
    this.shieldGenerator.stopShieldField();
    this.shielded = false;
  };

  // critical hit
  data.critical && damage.critical();

  if(data.hardpoint) {
    attacker = ships[data.uuid];
    defender = ships[data.hardpoint.ship];
    
    if(defender){
      targetingComputer.hit(defender, data);
      defender.selector.damage();
      defender.selector.timer && defender.events.remove(defender.selector.timer);
      defender.selector.timer = defender.events.add(500, defender.selector.reset, defender.selector);

      // show hud screen
      defender.hud.show();
      defender.hud.timer && defender.events.remove(defender.hud.timer);
      defender.hud.timer = defender.events.add(3000, defender.hud.hide, defender.hud);
    
      if(defender.isPlayer && attacker.data.hardpoints[0].subtype !== 'repair' && data.hardpoint.damage > 4) { 
      // this.game.camera.shake();
      }
  };
    }


  if(data.durability) {
    if(data.durability < this.config.stats.durability) {
      this.alpha = (data.durability / this.config.stats.durability);
    }
  }

  // update hud
  this.hud.data(data);
};

Ship.prototype.update = function() {
  var time = this.game.time,
      velocity = this.movement.velocity,
      speed = this.config.stats.speed,
      multiplier = velocity/speed;
      
  this.events.update(this.game.clock.time);
  this.movement.update();
  this.targetingComputer.update();
  this.hud.update();
  this.selector.update();

  // update disabled state
  if(this.disabled) {
    this.engineCore.update(0);
    this.explosion.update();
  } else {
    this.engineCore.update(multiplier);
  }

};

Ship.prototype.enable = function(data) {
  this.alpha = 1.0;
  this.disabled = false;
  this.chassis.tint = 0xFFFFFF;
  this.hud.enable();
  this.selector.enable();
  this.engineCore.show(true);
  this.position.set(data.pos.x, data.pos.y);

  if(this.isPlayer){
    var soundArr = ['reactor-online', 'weapons-systems-online', 'repairs-completed']
    this.game.emit('squad/regroup', this);
    this.game.emit('hotkeys/refresh', this);
    this.game.emit('system/sound', this.game.rnd.pick(soundArr));
    this.game.emit('player/enabled');
  }
};

Ship.prototype.disable = function() {
  this.disabled = true;
  this.chassis.tint = 0x333333;
  this.hud.disable();
  if(this.data.chassis === 'squad-shield'){
    this.selector.shieldBlueStop();
  }
  this.selector.disable();
  this.engineCore.stop();
  this.engineCore.show(false);
  this.shieldGenerator.stop();
  this.repair.stop();
  if(this.data.faction === 'tutorial' && this.manager.ships[this.data.attacker].isPlayer){
    this.game.emit('tutorial/advance');
  }
  if(this.isPlayer){
    this.game.emit('player/disabled');
  }
};

Ship.prototype.explode = function() {
  this.explosion.start();
};

Ship.prototype.showHud = function(duration) {
  this.hud.show();
  this.hud.timer && this.events.remove(this.hud.timer);
  this.hud.timer = this.events.add(duration, this.hud.hide, this.hud);
};

Ship.prototype.destroy = function(options) {
  // remove timers
  this.events.destroy();
  this.data.removeListener('data', this.data);

  this.hud.destroy();
  this.selector.destroy();
  this.movement.destroy();
  this.engineCore.destroy();
  this.targetingComputer.destroy();
  this.repair.destroy();
  this.explosion.destroy();

  // children destroy themselves
  engine.Sprite.prototype.destroy.call(this, options);

  this.manager = this.config =
    this.movement = this.circle = this.hud =
    this.selector = this.data = this.targetingComputer =
    this.repair = this.engineCore = undefined;
};

Object.defineProperty(Ship.prototype, 'isPlayer', {
  get: function() {
    return this.user !== undefined && this.game.auth.user.uuid === this.user;
  }
});

module.exports = Ship;
