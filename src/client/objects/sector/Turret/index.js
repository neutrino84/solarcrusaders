
var engine = require('engine')//,
    // Laser = require('./Laser'),
    // Missile = require('./Missile');

function Turret(parent, config) {
  this.parent = parent;
  this.game = parent.game;
  this.ship = parent.parent;
  this.config = config;

  this.on = true;
  this.cooldown = 1500; // config.cooldown
  this.circle = new engine.Circle();
  this.target = new engine.Point();
  this.position = new engine.Point();
  this._tempPosition = new engine.Point();

  this.sprite = new engine.Sprite(this.game, config.sprite);
  this.sprite.position.set(config.position.x, config.position.y);
  this.sprite.pivot.set(config.pivot.x, config.pivot.y);
  this.sprite.scale.set(config.scale.x, config.scale.y);

  this.manager = this.create(config.type);

  // this.game.clock.events.loop(this.cooldown, this.queueTargets, this);
};

Turret.prototype.constructor = Turret;

Turret.prototype.create = function(type) {
  var config = this.config[type];
  // switch(type) {
  //   case 'missile':
  //     return new Missile(this, config);
  //   case 'laser':
  //   default:
  //     return new Laser(this, config);
  // }
};

Turret.prototype.fire = function() {
  // this.manager.fire();
};

Turret.prototype.queueTargets = function() {
  var circle, delay,
      ship = this.ship,
      target = this.ship.target;
  if(target && !ship.disabled) {
    delay = global.Math.random() * (this.cooldown - 500),
    circle = this.circle.setTo(target.position.x, target.position.y, global.Math.sqrt(target.getBounds().perimeter));
    this.target = circle.random(true);
    this.game.clock.events.add(delay, this.fire, this);
  }
};

Turret.prototype.update = function() {
  var apos, sprite = this.sprite,
      game = this.game,
      position = this.position,
      manager = this.manager;
  
  position.copyFrom(game.world.worldTransform.applyInverse(sprite.worldTransform.apply(sprite.pivot)));
  sprite.rotation = engine.Point.angle(position, apos = this.absoluteTargetPosition()) - this.ship.rotation;
  
  // manager.start.copyFrom(position);
  // manager.end.copyFrom(apos);
};

Turret.prototype.absoluteTargetPosition = function() {
  return engine.Point.add(this.ship.target.position, this.target, this._tempPosition);
}

module.exports = Turret;
