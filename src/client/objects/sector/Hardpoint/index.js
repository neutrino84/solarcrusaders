
var engine = require('engine'),
    Laser = require('./Laser'),
    Missile = require('./Missile');

function Hardpoint(parent, data, config) {
  this.parent = parent;
  this.game = parent.game;
  this.ship = parent.parent;
  this.target = parent.target;
  this.config = config;
  this.data = data;

  this.position = new engine.Point();

  // move this out
  // this.absolute = new engine.Point();

  this.cap = new engine.Sprite(this.game, 'texture-atlas', 'turret-cap-' + this.ship.config.race + '.png');
  this.sprite = new engine.Sprite(this.game, 'texture-atlas', data.sprite + '.png');
  this.sprite.position.set(config.position.x, config.position.y);
  this.sprite.pivot.set(config.pivot.x, config.pivot.y);
  this.ship.addChild(this.sprite);
  this.sprite.addChild(this.cap);

  this.manager = this.create(data.type);
};

Hardpoint.prototype.constructor = Hardpoint;

Hardpoint.prototype.create = function(type) {
  switch(type) {
    case 'rocket':
      return new Missile(this);
    case 'laser':
    default:
      return new Laser(this);
  }
};

Hardpoint.prototype.fire = function(distance) {
  this.updateTransform();
  this.manager.start(this.position, this.target, distance);
};

Hardpoint.prototype.update = function() {
  var position = this.position,
      target = this.target;
  if(this.manager.update && this.manager.isRunning) {
    this.updateTransform();
    this.manager.update(position, target);
  }  
};

Hardpoint.prototype.explode = function(target) {
  var game = this.game,
      parent = this.ship,
      manager = this.ship.manager;
  manager.shipsGroup.iterate('renderable', true, engine.Group.NONE, function(ship) {
    if(parent == ship) { return };
    if(ship.contains(target.x, target.y)) {
      manager.explosionEmitter.at({ center: target });
      manager.explosionEmitter.explode(2);

      // inflict damage
      // game.world.worldTransform.apply(this.target, this.absolute);
      // ship.worldTransform.applyInverse(this.absolute, this.absolute);
      // ship.damage.inflict(this.absolute);        

      if(ship.isPlayer) {
        game.camera.shake();
        parent.highlight();
      }
    }
  }, this);
};

Hardpoint.prototype.updateTransform = function() {
  var game = this.game,
      ship = this.ship,
      sprite = this.sprite,
      position = this.position,
      target = this.target;

  // absolute position
  ship.updateTransform();
  game.world.worldTransform.applyInverse(ship.worldTransform.apply(sprite), position);
  engine.Line.pointAtDistance({ x: position.x, y: position.y }, target, 18, position);
  
  // update rotation
  sprite.rotation = engine.Point.angle(position, target)-ship.rotation;
};

Hardpoint.prototype.destroy = function() {
  this.manager && this.manager.destroy();
  
  this.parent = this.game = this.ship =
    this.config = this.target = this.cap =
    this.position = this.sprite = this.manager =
    this.data = undefined;
};

module.exports = Hardpoint;
