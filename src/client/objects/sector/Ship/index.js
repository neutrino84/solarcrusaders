
var engine = require('engine'),
    Movement = require('../Movement'),
    Repair = require('./Repair'),
    EngineCore = require('./EngineCore'),
    TargetingComputer = require('./TargetingComputer'),
    ShieldGenerator = require('./ShieldGenerator'),
    Damage = require('./Damage'),
    Hud = require('../../../ui/components/Hud');

function Ship(manager, details) {
  engine.Sprite.call(this, manager.game, 'texture-atlas', details.chassis + '.png');

  this.name = details.name;
  this.manager = manager;
  this.details = details;
  
  this.config = details.config.ship;

  // layer chassis
  this.rotation = 0; //details.rotation;
  this.chassis = new engine.Sprite(manager.game, 'texture-atlas', details.chassis + '.png');
  this.pivot.set(this.width / 2, this.width / 2);

  // activate culling
  // this.autoCull = true;
  // this.checkWorldBounds = true;

  // core ship classes
  this.hud = new Hud(this);
  this.damage = new Damage(this);
  this.movement = new Movement(this);
  this.engineCore = new EngineCore(this, this.config.engine);
  this.targetingComputer = new TargetingComputer(this, this.config.targeting);
  this.shieldGenerator = new ShieldGenerator(this, this.config.shields);
  this.repair = new Repair(this);
}

Ship.prototype = Object.create(engine.Sprite.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.boot = function() {
  // create hit area
  this.hit = new engine.Circle(this.width / 2, this.width / 2, this.details.size);
  // this.hitCircle.drawCircle(this.hit.x, this.hit.y, this.hit.radius);

  // add chassis
  this.addChild(this.chassis);

  this.engineCore.create();
  this.targetingComputer.create();
  this.shieldGenerator.create();
  this.repair.create();
  this.hud.create();

  this.details.on('data', this.data, this);

  // set player
  if(this.isPlayer) {
    this.game.emit('ship/player', this);
  }
};

Ship.prototype.data = function(data) {
  if(data.hardpoint) {
    this.targetingComputer.hit(data.hardpoint);
  }
};

Ship.prototype.update = function() {
  this.movement.update();
  this.targetingComputer.update();
  
  // update disabled state
  if(this.disabled){
    this.damage.update(this.movement.velocity / this.details.speed);
    this.engineCore.update(0);
  } else {
    this.engineCore.update(this.movement.velocity / this.details.speed);
  }
  
  // update ui
  this.hud.update();

  engine.Sprite.prototype.update.call(this);
};

Ship.prototype.enable = function(data) {
  this.disabled = false;
  this.tint = 0xFFFFFF;
  this.chassis.visible = true;
  this.engineCore.show(true);
  this.position.set(data.pos.x, data.pos.y);
};

Ship.prototype.disable = function() {
  this.disabled = true;
  this.tint = 0x333333;
  this.chassis.visible = false;
  this.damage.destroyed();
  this.engineCore.show(false);
  this.shieldGenerator.stop();
  this.repair.stop();
}

Ship.prototype.destroy = function() {
  this.hud.destroy();
  this.damage.destroy();
  this.movement.destroy();
  this.engineCore.destroy();
  this.targetingComputer.destroy();
  this.repair.destroy();

  this.details.removeListener('data', this.data);

  // children destroy themselves
  engine.Sprite.prototype.destroy.call(this);

  this.manager = this.config =
    this.movement = this.circle = this.hud =
    this.damage = this.details = this.targetingComputer =
    this.repair = this.engineCore = undefined;
};

Object.defineProperty(Ship.prototype, 'isPlayer', {
  get: function() {
    return this.user !== undefined && this.game.auth.user.uuid === this.user;
  }
});

module.exports = Ship;
