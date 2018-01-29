
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

  this.manager = manager;
  this.game = manager.game;

  // convenience
  this.data = data;
  this.name = data.name;
  this.uuid = data.uuid;

  // config data
  this.config = data.config.ship;

  // master ship
  this.master = manager.game.ships[data.master];

  // layer chassis
  this.chassis = new engine.Sprite(this.game, 'texture-atlas', data.chassis + '.png');

  // defaults
  this.disabled = data.disabled;
  this.position.set(data.x, data.y);
  this.pivot.set(this.width/2, this.height/2);
  this.rotation = data.rotation + global.Math.PI;

  // timer events
  this.events = new engine.Timer(this.game, false);

  // core ship classes
  this.hud = new Hud(this);
  this.movement = new Movement(this);
  this.damage = new Damage(this);
  this.targetingComputer = new TargetingComputer(this, this.config.targeting);
  this.engineCore = new EngineCore(this, this.config.engine);
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

  // start events
  this.events.start();

  // create main systems
  this.targetingComputer.create();
  this.engineCore.create();
  this.shieldGenerator.create();
  this.repair.create();
  this.hud.create();
  this.damage.create();
  this.explosion.create();
  this.selector.create();

  // first refresh
  this.refresh(this.data);

  // subscribe to updates
  this.data.on('data', this.refresh, this);
};

Ship.prototype.refresh = function(data) {
  var game = this.game,
      damage = this.damage,
      targetingComputer = this.targetingComputer,
      hud = this.hud,
      ships = game.ships,
      stations = game.stations,
      ship, attacker, defender;

  // handle critical hit
  data.critical && damage.critical();

  // master ship instance
  if(data.master && game.ships[data.master]) {
    this.master = game.ships[data.master];
  }

  // set disabled state
  if(data.disabled === true) {
    if(data.disabled !== this.disabled) {
      this.explosion.start();
    }
    this.disable();
  } else if(data.disabled === false) {
    this.enable();
  }

  // update hud
  if(data.hardpoint) {
    attacker = ships[data.uuid];
    defender = ships[data.hardpoint.uuid] || stations[data.hardpoint.uuid];

    if(defender) {
      // ship hit fx
      targetingComputer.hit(defender, data);

      // camera and hud
      if(defender.isPlayer) {
        game.camera.shake();
      } else {
        defender.hud.show();
        defender.hud.timer && defender.events.remove(defender.hud.timer);
        defender.hud.timer = defender.events.add(3000, defender.hud.hide, defender.hud);

        // targeted
        if(defender.selector && !defender.isPlayerOwned && (
            attacker.isPlayer || attacker.isPlayerOwned)) {
          defender.selector.targeted();
        }
      }
    }
  }

  // update hud
  hud.data(data);
};

Ship.prototype.update = function() {
  // update systems
  this.movement.update();
  this.targetingComputer.update();
  this.hud.update();
  this.selector.update();
  this.engineCore.update();
  this.explosion.update();

  // update timers
  this.events.update(this.game.clock.time);

  // update inherited
  engine.Sprite.prototype.update.call(this);
};

Ship.prototype.enable = function() {
  // disabled state
  this.disabled = false;

  // helpers
  if(this.isPlayer) {
    this.hud.show();
  }
  this.hud.enable();
  this.selector.show();
  this.engineCore.show();
};

Ship.prototype.disable = function() {
  var children = this.children,
      child;

  // disabled state
  this.disabled = true;
  this.tint = 0x888888;

  // helpers
  this.hud.hide();
  this.hud.disable();
  this.selector.hide();
  this.engineCore.stop();
  this.engineCore.hide();
  this.shieldGenerator.stop();
  this.repair.stop();

  for(var i=0; i<children.length; i++) {
    child = children[i];
    child.tint = 0x888888;
  }

  // disable fire
  if(this.isPlayer) {
    this.manager.autofire && this.game.clock.events.remove(this.manager.autofire);
  }
};

Ship.prototype.remove = function() {
  // fade out and remove
  this.fade = this.game.tweens.create(this);
  this.fade.to({ alpha: 0 }, 1000, engine.Easing.Quadratic.InOut, true);
  this.fade.on('complete', this.destroy, this);
};

Ship.prototype.destroy = function(options) {
  // remove timers
  this.events.destroy();

  // stop listening to data
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
    this.movement = this.hud = this.selector = 
    this.data = this.targetingComputer = this.explosion =
    this.repair = this.engineCore = undefined;
};

Object.defineProperty(Ship.prototype, 'isPirate', {
  get: function() {
    return this.data.ai === 'pirate' || (this.master && this.master.data.ai === 'pirate');
  }
});

Object.defineProperty(Ship.prototype, 'isPlayer', {
  get: function() {
    return this.data.user && this.game.auth.user.uuid === this.data.user;
  }
});

Object.defineProperty(Ship.prototype, 'isPlayerOwned', {
  get: function() {
    return this.data.master && this.game.auth.user.ship === this.data.master;
  }
});

module.exports = Ship;
