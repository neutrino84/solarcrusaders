
var engine = require('engine'),
    Laser = require('./Laser'),
    Missile = require('./Missile');

function Turret(parent, config) {
  this.parent = parent;
  this.game = parent.game;
  this.ship = parent.parent;
  this.config = config;

  this.circle = new engine.Circle();
  this.target = new engine.Point();
  this.position = new engine.Point();
  this.apos = new engine.Point();

  this.sprite = new engine.Sprite(this.game, 'ship-atlas', config.sprite + '.png');
  this.sprite.position.set(config.position.x, config.position.y);
  this.sprite.pivot.set(config.pivot.x, config.pivot.y);
  this.sprite.scale.set(config.scale.x, config.scale.y);

  this.manager = this.create(config.type);
};

Turret.prototype.constructor = Turret;

Turret.prototype.create = function(type) {
  var config = this.config[type];
  switch(type) {
    case 'missile':
      return new Missile(this, config);
    case 'laser':
    default:
      return new Laser(this, config);
  }
};

Turret.prototype.fire = function() {
  delay = global.Math.random() * 500;
  this.game.clock.events.add(delay, this.discharge, this);
};

Turret.prototype.discharge = function() {
  var circle, delay,
      ship = this.ship,
      target = ship.target;
  if(target) {
    circle = this.circle.setTo(target.position.x, target.position.y, global.Math.sqrt(target.getBounds().perimeter));
    this.target = circle.random(true);
    this.manager.fire();
  }
};

Turret.prototype.update = function() {
  var apos, sprite = this.sprite,
      game = this.game,
      position = this.position,
      manager = this.manager;
  
  position.copyFrom(game.world.worldTransform.applyInverse(sprite.worldTransform.apply(sprite.pivot)));
  sprite.rotation = engine.Point.angle(position, apos = this.absoluteTargetPosition()) - this.ship.rotation;

  manager.start.copyFrom(position);
  manager.end.copyFrom(apos);

  this.manager.update();
};

Turret.prototype.absoluteTargetPosition = function() {
  return engine.Point.add(this.ship.target.position, this.target, this.apos);
}

module.exports = Turret;
