
var engine = require('engine'),
    Movement = require('../Movement'),
    Reactor = require('./Reactor'),
    EngineCore = require('./EngineCore'),
    TargetingComputer = require('./TargetingComputer'),
    ShieldGenerator = require('./ShieldGenerator'),
    Damage = require('./Damage'),
    Hud = require('../../../ui/components/Hud');

function Ship(manager, key) {
  engine.Sprite.call(this, manager.game, 'texture-atlas', key + '.png');

  this.name = key;
  this.target = null;
  this.targeted = [];

  this.manager = manager;
  this.game = manager.game;
  this.config = manager.game.cache.getJSON('ship-configuration', false)[key];

  this.rotation = 0.0;
  this.position = new engine.Point();
  
  this.pivot.set(this.texture.frame.width / 2, this.texture.frame.height / 2);
  this.scale.set(this.config.size, this.config.size);

  this.hud = new Hud(this);
  this.damage = new Damage(this);
  this.movement = new Movement(this);
  this.circle = new engine.Circle(this.pivot.x, this.pivot.y, this.texture.frame.width / 2);

  this._selected = false;

  // activate culling
  this.autoCull = true;
  this.checkWorldBounds = true;

  // core ship classes
  this.reactor = new Reactor(this);
  this.engineCore = new EngineCore(this);
  this.targetingComputer = new TargetingComputer(this, this.config.targeting);
  this.shieldGenerator = new ShieldGenerator(this);
  
  // selection graphic
  this.graphics = new engine.Graphics(manager.game);
  this.graphics.blendMode = engine.BlendMode.ADD;
  this.addChild(this.graphics);
}

Ship.prototype = Object.create(engine.Sprite.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.boot = function() {
  this.reactor.create();
  this.engineCore.create();
  this.targetingComputer.create();
  this.hud.create();
  this.details.systems.shield && this.shieldGenerator.create();
  this.details.on('data', this.data, this);
};

Ship.prototype.data = function(data) {
  if(data.speed) {
    this.movement.reset();
    if(this.movement.animation.isPlaying) {
      this.movement.update();
      this.movement.plot();
    }
  }
  if(data.health !== undefined) {
    this.hud.healthBar.setProgressBar(
      global.Math.min(1.0, data.health / this.config.stats.health));
  }
};

Ship.prototype.update = function() {
  var speed,
      movement = this.movement;

  // update position
  movement.update();

  if(!this.destroyed) {
    this.targetingComputer.update();
    
    if(this.renderable) {
      speed = movement.speed;

      if(speed > 0) {
        this.engineCore.update(speed / movement.maxSpeed);
      }
    }
  }
};

Ship.prototype.select = function() {
  this._selected = true;
  this.hud.healthBar.renderable = true;
  this.graphics.clear();
  this.graphics.lineStyle(3.0 / this.scale.x, this.isPlayer ? 0x33FF66 : 0x336699, this.isPlayer ? 0.6 : 0.5);
  this.graphics.beginFill(this.isPlayer ? 0x33FF66 : 0x336699, 0.25);
  this.graphics.drawCircle(this.pivot.x, this.pivot.y, this.width / this.scale.x / 1.8); //(0, 0, this.width / this.scale.x, this.height / this.scale.y);
  this.graphics.endFill();
};

Ship.prototype.deselect = function() {
  this._selected = false;
  this.hud.healthBar.renderable = false;
  this.graphics.clear();
  if(this.isPlayer) {
    this.graphics.lineStyle(2.0 / this.scale.x, 0x33FF66, 0.4);
    this.graphics.beginFill(0x33FF66, 0.1);
    this.graphics.drawCircle(this.pivot.x, this.pivot.y, this.width / this.scale.x / 1.8);
    this.graphics.endFill();
  }
};

Ship.prototype.destroy = function() {
  this.targeted = [];

  this.reactor.destroy();
  this.hud.destroy();
  this.damage.destroy();
  this.movement.destroy();
  this.shieldGenerator.destroy();
  this.targetingComputer.destroy();

  this.details.removeListener('data', this.data);

  engine.Sprite.prototype.destroy.call(this);

  this.manager = this.game = this.config =
    this.movement = this.circle = this.hud =
    this.damage = this.details = undefined;
};

Ship.prototype.activate = function(enhancement) {
  switch(enhancement) {
    case 'piercing':
      this.targetingComputer.enadd(enhancement);
      break;
    case 'overload':
      this.reactor.start();
      break;
    case 'booster':
      this.engineCore.booster = true;
      break;
    case 'shield':
      this.shieldGenerator.start();
      break;
  }
};

Ship.prototype.deactivate = function(enhancement) {
  switch(enhancement) {
    case 'piercing':
      this.targetingComputer.enremove(enhancement);
      break;
    case 'overload':
      this.reactor.stop();
      break;
    case 'booster':
      this.engineCore.booster = false;
      break;
    case 'shield':
      this.shieldGenerator.stop();
      break;
  }
};

Object.defineProperty(Ship.prototype, 'isPlayer', {
  get: function() {
    return this.user && this.game.auth.user.uuid === this.user;
  }
});

Object.defineProperty(Ship.prototype, 'speed', {
  get: function() {
    return this.details ? this.details.speed : this.config.stats.speed;
  }
});

Object.defineProperty(Ship.prototype, 'shields', {
  get: function() {
    return this.shieldGenerator && this.shieldGenerator.fadeTween &&
      this.shieldGenerator.fadeTween.isRunning;
  }
});

Object.defineProperty(Ship.prototype, 'selected', {
  get: function() {
    return this._selected;
  }
});

module.exports = Ship;
