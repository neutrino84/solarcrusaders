
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
  this.state = manager.state;
  this.game = manager.game;
  this.data = data;
  
  // config data
  this.config = data.config.ship;

  // layer chassis
  this.chassis = new engine.Sprite(this.game, 'texture-atlas', data.chassis + '.png');

  // defaults
  this.rotation = data.rotation + global.Math.PI;
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

Ship.prototype.create = function() {
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
    this.hud.show();
    this.game.emit('ship/player', this);
  }
};

Ship.prototype.refresh = function(data) {
  var ship, attacker, defender,
      game = this.game,
      damage = this.damage,
      ships = this.manager.ships,
      stations = this.state.stationManager.stations,
      targetingComputer = this.targetingComputer;

  // critical hit
  data.critical && damage.critical();

  // 
  if(data.hardpoint) {
    attacker = ships[data.uuid];
    defender = ships[data.hardpoint.ship] || stations[data.hardpoint.station];

    if(defender) {
      targetingComputer.hit(defender, data);

      // show hud screen
      defender.hud.show();
      defender.hud.timer && defender.events.remove(defender.hud.timer);
      defender.hud.timer = defender.events.add(10000, defender.hud.hide, defender.hud);

      if(defender.isPlayer) {
        game.camera.shake();
      }
    }
  };

  // update hud
  this.hud.data(data);
};

Ship.prototype.update = function() {
  var time = this.game.time,
      velocity = this.movement.velocity,
      speed = this.config.stats.speed,
      multiplier = velocity/speed;

  // update systems
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

  // update timers
  this.events.update(this.game.clock.time);

  engine.Sprite.prototype.update.call(this);
};

Ship.prototype.enable = function(data) {
  this.alpha = 1.0;
  this.disabled = false;
  // this.chassis.tint = 0xFFFFFF;
  this.hud.enable();
  this.selector.enable();
  this.engineCore.show(true);
  this.position.set(data.pos.x, data.pos.y);
};

Ship.prototype.disable = function() {
  this.disabled = true;
  // this.chassis.tint = 0x333333;
  this.hud.disable();
  this.selector.disable();
  this.engineCore.stop();
  this.engineCore.show(false);
  this.shieldGenerator.stop();
  this.repair.stop();
};

Ship.prototype.explode = function() {
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

  this.manager = this.state = this.config =
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
