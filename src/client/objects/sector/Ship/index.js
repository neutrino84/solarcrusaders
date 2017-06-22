
var engine = require('engine'),
    Movement = require('../Movement'),
    Repair = require('./Repair'),
    EngineCore = require('./EngineCore'),
    TargetingComputer = require('./TargetingComputer'),
    ShieldGenerator = require('./ShieldGenerator'),
    Explosion = require('./Explosion'),
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
  this.rotation = data.rotation + global.Math.PI;
  this.pivot.set(this.width/2, this.height/2);

  // timer events
  this.events = new engine.Timer(this.game, false);

  // core ship classes
  this.hud = new Hud(this);
  this.selector = new Selector(this);
  this.movement = new Movement(this);
  this.engineCore = new EngineCore(this, this.config.engine);
  this.targetingComputer = new TargetingComputer(this, this.config.targeting);
  this.shieldGenerator = new ShieldGenerator(this, this.config.shields);
  this.repair = new Repair(this);
  this.explosion = new Explosion(this);
}

Ship.prototype = Object.create(engine.Sprite.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.boot = function() {
  // add chassis
  this.addChild(this.chassis);

  // create main systems
  this.selector.create();
  this.engineCore.create();
  this.targetingComputer.create();
  this.shieldGenerator.create();
  this.repair.create();
  this.hud.create();
  this.explosion.create();

  // subscribe to updates
  this.data.on('data', this.refresh, this);

  // start events
  this.events.start();

  // set player
  if(this.isPlayer) {
    // this.hud.show();
    this.game.emit('ship/player', this);
  }
};

Ship.prototype.refresh = function(data) {
  var ship, attacker, defender,
      ships = this.manager.ships,
      targetingComputer = this.targetingComputer;

  if(data.hardpoint) {
    attacker = ships[data.uuid];
    defender = ships[data.hardpoint.ship];

    // send hit to targeting computer
    targetingComputer.hit(defender, data);
    // show hud screen
    if(attacker.isPlayer || defender.isPlayer) {

      attacker.selector.highlight();
      defender.selector.highlight();

      defender.hud.show();
      defender.timer && defender.events.remove(defender.timer);
      defender.timer = defender.events.add(6000, function() {
        this.hud.hide();
      }, defender);

      if(defender.isPlayer) {
        this.game.camera.shake();
      }
    };
    // show hud for squad ships
    if(defender.data.masterShip && this.manager.ships[defender.data.masterShip].isPlayer){
      defender.hud.show();
      defender.timer && defender.events.remove(defender.timer);
      defender.timer = defender.events.add(5000, function() {
        this.hud.hide();
      }, defender);
    };
    if(attacker.data.masterShip && this.manager.ships[attacker.data.masterShip].isPlayer){
      defender.hud.show();
      defender.timer && defender.events.remove(defender.timer);
      defender.timer = defender.events.add(5000, function() {
        this.hud.hide();
      }, defender);
    };

    //SHOW HUD FOR SQUAD SHIPS BEING ATTACKED
  };
  if(data.durability < this.config.stats.durability){
   this.alpha = (data.durability / this.config.stats.durability);
  }
  // update hud
  this.hud.data(data);
};

Ship.prototype.update = function() {
  var time = this.game.time,
      velocity = this.movement.velocity,
      speed = this.data.speed,
      multiplier = velocity/speed;
      
  this.movement.update();
  this.events.update(this.game.clock.time);
  this.targetingComputer.update();
  this.hud.update();
  this.selector.update();
  
  // if(this.data.durability < this.config.stats.durability){
  //  this.alpha = (this.data.durability / this.config.stats.durability * 0.5)  + .5;
  // }
  // update disabled state
  if(this.disabled){
    this.engineCore.update(0);
    this.explosion.update();
  } else {
    this.engineCore.update(multiplier);
  }

  engine.Sprite.prototype.update.call(this);
};

Ship.prototype.enable = function(data) {
  this.alpha = 1;
  this.disabled = false;
  this.chassis.tint = 0xFFFFFF;
  this.hud.enable();
  this.selector.enable();
  this.engineCore.show(true);
  this.position.set(data.pos.x, data.pos.y);
  if(this.isPlayer){
    this.game.emit('squad/regroup', this);
    // this.user.socket.emit('squad/regroup', this);
  }
};

Ship.prototype.disable = function() {
  this.disabled = true;
  this.chassis.tint = 0x333333;
  this.hud.disable();
  this.selector.disable();
  this.engineCore.show(false);
  this.shieldGenerator.stop();
  this.repair.stop();
  this.explosion.start();
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
