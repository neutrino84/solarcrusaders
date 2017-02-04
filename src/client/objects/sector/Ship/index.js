
var engine = require('engine'),
    Movement = require('../Movement'),
    Repair = require('./Repair'),
    EngineCore = require('./EngineCore'),
    TargetingComputer = require('./TargetingComputer'),
    ShieldGenerator = require('./ShieldGenerator'),
    Damage = require('./Damage'),
    Hud = require('../../../ui/components/Hud');

function Ship(manager, name) {
  engine.Sprite.call(this, manager.game, 'texture-atlas', name + '.png');

  this.name = name;
  this.manager = manager;
  this.config = manager.game.cache.getJSON('ship-configuration', false)[name];

  // registry
  this.timers = [];
  this.rotation = 0.0;
  this.chassis = new engine.Sprite(manager.game, 'texture-atlas', name + '.png');
  this.pivot.set(this.texture.frame.width / 2, this.texture.frame.height / 2);

  // this.hud = new Hud(this);
  this.damage = new Damage(this);
  this.movement = new Movement(this);
  
  this.circle = new engine.Circle(this.pivot.x, this.pivot.y, this.chassis.texture.frame.width / 2);

  // activate culling
  // this.autoCull = true;
  // this.checkWorldBounds = true;

  // core ship classes
  this.engineCore = new EngineCore(this, this.config.engine);
  this.targetingComputer = new TargetingComputer(this, this.config.targeting);
  this.shieldGenerator = new ShieldGenerator(this, this.config.shields);
  // this.repair = new Repair(this, {});
  
  // selection
  this.selected = false;
  // this.graphics = new engine.Graphics(manager.game);
  // this.graphics.blendMode = engine.BlendMode.ADD;
  // this.graphics.objectRenderer = 'wireframe';
}

Ship.prototype = Object.create(engine.Sprite.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.boot = function() {
  // this.addChild(this.graphics);
  this.addChild(this.chassis);

  this.engineCore.create();
  this.targetingComputer.create();
  this.shieldGenerator.create();
  // this.repair.create();
  // this.hud.create();

  this.details.on('data', this.data, this);

  // max range
  // this.graphics.lineStyle(1.0, this.isPlayer ? 0xFFFFFF : 0xFF0000, this.isPlayer ? 0.1 : 1.0);
  // this.graphics.drawCircle(this.circle.x, this.circle.y, this.circle.radius);

  // update health
  // this.hud.healthBar.setProgressBar(global.Math.min(1.0,
  //   this.details.health / this.config.stats.health));

  // update stats
  // this.hud.updateStats(this.details);

  // set player
  if(this.isPlayer) {
    this.select();

    this.game.emit('ship/player', this);
    this.game.emit('ship/follow', this);
  } else {
    this.deselect();
  }
};

Ship.prototype.data = function(data) {
  var hud = this.hud,
      config = this.config,
      targetingComputer = this.targetingComputer,
      percent;
  if(data.hardpoint) {
    targetingComputer.hit(data.hardpoint);
  }
  if(data.health !== undefined) {
    // percent = data.health / config.stats.health;
    // hud.healthBar.setProgressBar(global.Math.min(1.0, percent));
  }
  if(data.kills || data.assists || data.disables) {
    // hud.updateStats(this.details);
  }
};

Ship.prototype.update = function() {
  this.movement.update();
  this.targetingComputer.update();
  if(!this.disabled){
    this.engineCore.update(this.movement.velocity / this.details.speed);
  }
  // this.hud.update();
  engine.Sprite.prototype.update.call(this);
};

Ship.prototype.select = function() {
  this.selected = true;
  // this.graphics.renderable = true;
};

Ship.prototype.deselect = function() {
  this.selected = false;
  // this.graphics.renderable = false;
};

Ship.prototype.highlight = function() {
  this.select();
  this.timer && this.game.clock.events.remove(this.timer);
  this.timer = this.game.clock.events.add(8000, this.deselect, this);
  this.timers.push(this.timer);
};

Ship.prototype.contains = function(x, y) {
  var radius = this.circle.radius,
      left = this.x - radius,
      right = this.x + radius,
      top = this.y - radius,
      bottom = this.y + radius;
  if(x >= left && x <= right && y >= top && y <= bottom) {
    var dx = (this.position.x - x) * (this.position.x - x);
    var dy = (this.position.y - y) * (this.position.y - y);

    return (dx + dy) <= (radius * radius);
  } else {
    return false;
  }
};

Ship.prototype.overlap = function(r) {
  var right = this.x + this.width - this.pivot.x,
      bottom = this.y + this.height - this.pivot.y;
  return !(right < r.x || bottom < r.y || this.x - this.pivot.x > r.right || this.y - this.pivot.y > r.bottom);
};

Ship.prototype.enable = function() {
  this.disabled = false;
  this.chassis.tint = 0xFFFFFF;
  this.engineCore.show(true);
  // this.hud.healthBar.setProgressBar(1.0);
};

Ship.prototype.disable = function() {
  this.disabled = true;
  this.chassis.tint = 0x444444;
  this.damage.destroyed();
  this.engineCore.show(false);
  this.shieldGenerator.stop();
  // this.repair.stop();
  // this.hud.healthBar.setProgressBar(0.0);

  if(!this.isPlayer) {
    this.deselect();
  }
}

Ship.prototype.destroy = function() {
  // destroy timers
  // .. this should be changed
  // .. to a custom clock timer :(
  while(this.timers.length > 0) {
    this.game.clock.events.remove(this.timers.pop());
  }

  // this.hud.destroy();
  this.damage.destroy();
  this.movement.destroy();
  this.engineCore.destroy();
  this.targetingComputer.destroy();
  // this.repair.destroy();

  this.details.removeListener('data', this.data);

  // children destroy themselves
  engine.Sprite.prototype.destroy.call(this);

  this.manager = this.game = this.config =
    this.movement = this.circle = this.hud =
    this.damage = this.details = undefined;
};

Object.defineProperty(Ship.prototype, 'isPlayer', {
  get: function() {
    return this.user && this.game.auth.user.uuid === this.user;
  }
});

Object.defineProperty(Ship.prototype, 'shields', {
  get: function() {
    return this.shieldGenerator && this.shieldGenerator.fadeTween &&
      this.shieldGenerator.fadeTween.isRunning;
  }
});

module.exports = Ship;
