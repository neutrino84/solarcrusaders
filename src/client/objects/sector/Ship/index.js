
var engine = require('engine'),
    Movement = require('../Movement'),
    EngineCore = require('./EngineCore'),
    TargetingComputer = require('./TargetingComputer'),
    ShieldGenerator = require('./ShieldGenerator'),
    Damage = require('./Damage'),
    Hud = require('../../../ui/components/Hud');

function Ship(manager, key) {
  engine.Group.call(this, manager.game, false);

  this.name = key;
  this.target = null;
  this.targeted = [];

  this.manager = manager;
  this.game = manager.game;
  this.config = manager.game.cache.getJSON('ship-configuration', false)[key];

  this.rotation = 0.0;
  this.position = new engine.Point(0, 0);
  this.chassis = new engine.Sprite(manager.game, 'texture-atlas', key + '.png');

  this.add(this.chassis);

  if(key === 'hederaa-x01') {
    this.lights = new engine.Sprite(manager.game, 'texture-atlas', key + '-lights.png');
    this.lights.position.set(124, 128);
    this.lights.pivot.set(128, 128);
    this.lights.scale.set(0.88, 1.04);

    this.lightsPosTween = this.game.tweens.create(this.lights.position);
    this.lightsPosTween.to({ x: 138 , y: 128 }, 2000, engine.Easing.Quadratic.InOut);
    this.lightsPosTween.yoyo(true);
    this.lightsPosTween.repeat();
    this.lightsPosTween.start();

    this.lightsScaleTween = this.game.tweens.create(this.lights.scale);
    this.lightsScaleTween.to({ x: 1.12 , y: 0.96 }, 2000, engine.Easing.Quadratic.InOut);
    this.lightsScaleTween.yoyo(true);
    this.lightsScaleTween.repeat();
    this.lightsScaleTween.start();

    this.add(this.lights);
  }
  
  this.pivot.set(this.chassis.texture.frame.width / 2, this.chassis.texture.frame.height / 2);

  this.hud = new Hud(this);
  this.damage = new Damage(this);
  this.movement = new Movement(this);
  this.circle = new engine.Circle(this.pivot.x, this.pivot.y, this.chassis.texture.frame.width / 2);
  this.hitCircle = new engine.Circle(this.pivot.x, this.pivot.y, this.chassis.texture.frame.width / 4);

  this._selected = false;

  // activate culling
  this.autoCull = true;
  this.checkWorldBounds = true;

  // core ship classes
  this.engineCore = new EngineCore(this);
  this.targetingComputer = new TargetingComputer(this, this.config.targeting);
  this.shieldGenerator = new ShieldGenerator(this, this.config.shields);
  
  // selection graphic
  this.graphics = new engine.Graphics(manager.game);
  this.graphics.blendMode = engine.BlendMode.ADD;
  this.graphics.objectRenderer = 'wireframe';

  this.addAt(this.graphics, 0);
}

Ship.prototype = Object.create(engine.Group.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.boot = function() {
  this.engineCore.create();
  this.targetingComputer.create();
  this.shieldGenerator.create();
  this.hud.create();

  this.details.on('data', this.data, this);

  this.graphics.lineStyle(1.0, this.isPlayer ? 0x55FFaa : 0x6699cc, 0.2);
  this.graphics.drawCircle(this.circle.x, this.circle.y, this.circle.radius);

  // update health
  this.hud.healthBar.setProgressBar(global.Math.min(1.0,
    this.details.health / this.config.stats.health));

  // update stats
  this.hud.updateStats(this.details);
};

Ship.prototype.interpolate = function(position, amount) {
  this.position.interpolate(position, amount, this.position);
};

Ship.prototype.data = function(data) {
  if(data.health !== undefined) {
    this.hud.healthBar.setProgressBar(global.Math.min(1.0,
      data.health / this.config.stats.health));
  }
  if(data.kills || data.assists || data.disables) {
    this.hud.updateStats(this.details);
  }
};

Ship.prototype.update = function() {
  var speed,
      movement = this.movement;
      movement.update();
  if(!this.destroyed) {
    this.targetingComputer.update();
    if(this.renderable) {
      this.engineCore.update(movement.speed / movement.maxSpeed);
      this.shieldGenerator.update();
    }
  }
};

Ship.prototype.select = function() {
  this._selected = true;

  this.hud.select();
  this.graphics.renderable = true;
};

Ship.prototype.deselect = function() {
  this._selected = false;

  this.hud.deselect();
  this.graphics.renderable = false;
};

Ship.prototype.overlap = function(rectangle) {
  return this.chassis.overlap(rectangle);
};

Ship.prototype.disabled = function() {
  this.shieldGenerator.stop();
  this.targetingComputer.cancel();
  this.target = null;
}

Ship.prototype.destroy = function() {
  this.targeted = [];

  this.hud.destroy();
  this.damage.destroy();
  this.movement.destroy();

  this.details.removeListener('data', this.data);

  // children destroy themselves
  engine.Group.prototype.destroy.call(this, false);

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
      break;
    case 'booster':
      this.engineCore.start();
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
      break;
    case 'booster':
      this.engineCore.stop();
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
