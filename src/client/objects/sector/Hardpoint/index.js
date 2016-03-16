
var engine = require('engine'),
    Laser = require('./Laser'),
    Missile = require('./Missile');

function Hardpoint(parent, data, config) {
  this.parent = parent;
  this.game = parent.game;
  this.ship = parent.parent;
  this.config = config;
  this.target = new engine.Point();
  this.position = new engine.Point();
  this.apos = new engine.Point();

  this._tempPoint = new engine.Point();

  this.cap = new engine.Sprite(this.game, 'texture-atlas', 'turret-cap-' + this.ship.config.race + '.png');
  this.sprite = new engine.Sprite(this.game, 'texture-atlas', data.sprite + '.png');
  this.sprite.position.set(config.position.x, config.position.y);
  this.sprite.pivot.set(config.pivot.x, config.pivot.y);
  this.ship.addChild(this.sprite);
  this.sprite.addChild(this.cap);

  this.manager = this.create(config.type);
};

Hardpoint.prototype.constructor = Hardpoint;

Hardpoint.prototype.create = function(type) {
  var config = this.config[type];
  switch(type) {
    case 'missile':
      return new Missile(this, config);
    case 'laser':
    default:
      return new Laser(this, config);
  }
};

Hardpoint.prototype.fire = function(index, miss) {
  var delay = index * 75 + 100,
      action = miss ? this.miss : this.discharge;
  if(!this.timer || (this.timer && this.timer.pendingDelete)) {
    this.timer = this.game.clock.events.add(delay, action, this);
  }
};

Hardpoint.prototype.miss = function() {
  var circle, delay,
      ship = this.ship,
      target = ship.target,
      enhancements = this.parent.enhancements;
  if(target) {
    circle = target.circle;
    this.target = circle.circumferencePoint(global.Math.random() * global.Math.PI, false, true, this._tempPoint);
    this.manager.fire(true, enhancements);
  }
};

Hardpoint.prototype.discharge = function() {
  var circle, delay,
      ship = this.ship,
      target = ship.target,
      enhancements = this.parent.enhancements;
  if(target) {
    circle = target.hitCircle;
    this.target = circle.random(false, this.target);
    this.manager.fire(false, enhancements, target.shields);
    if(target.isPlayer && !target.shields) {
      this.game.camera.shake();
    }
  }
};

Hardpoint.prototype.update = function() {
  var apos,
      game = this.game,
      sprite = this.sprite,
      ship = this.ship,
      position = this.position,
      manager = this.manager;

  position.copyFrom(game.world.worldTransform.applyInverse(ship.worldTransform.apply(sprite.worldTransform.apply(sprite.pivot))));
  sprite.rotation = engine.Point.angle(position, apos = this.absoluteTargetPosition()) - ship.rotation;

  manager.start.copyFrom(position);
  manager.end.copyFrom(apos);
  manager.update();
};

Hardpoint.prototype.absoluteTargetPosition = function() {
  return this.game.world.worldTransform.applyInverse(this.ship.target.worldTransform.apply(this.target));
};

Hardpoint.prototype.destroy = function() {
  this.timer && this.game.clock.events.remove(this.timer);

  this.sprite && this.sprite.destroy();
  this.manager && this.manager.destroy();
  
  this.parent = this.game = this.ship =
    this.config = this.target =
    this.position = this.apos = this.sprite = 
    this.manager = this.timer = this._tempPoint = undefined;
};

module.exports = Hardpoint;
