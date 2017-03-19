
var engine = require('engine'),
    Energy = require('./Energy'),
    Projectile = require('./Projectile'),
    Pulse = require('./Pulse'),
    Plasma = require('./Plasma'),
    Missile = require('./Missile');

function Hardpoint(parent, data, config) {
  this.parent = parent;
  this.game = parent.game;
  this.ship = parent.ship;
  this.config = config;
  this.data = data;

  this.cache = [];
  this.actives = [];
  this.cooled = true;
  this.isRunning = false;

  this.types = {
    rocket: Projectile,
    energy: Energy,
    pulse: Pulse,
    plasma: Plasma,
    missile: Missile
  };

  this.target = new engine.Point();
  this.origin = new engine.Point();

  this.cap = new engine.Sprite(this.game, 'texture-atlas', 'turret-cap-' + this.ship.config.race + '.png');
  this.sprite = new engine.Sprite(this.game, 'texture-atlas', data.sprite + '.png');
  this.sprite.position.set(config.position.x, config.position.y);
  this.sprite.pivot.set(config.pivot.x, config.pivot.y);
  
  this.ship.addChild(this.sprite);
  this.sprite.addChild(this.cap);
};

Hardpoint.prototype.constructor = Hardpoint;

Hardpoint.prototype.fire = function(targ) {
  var launcher, origin,
      data = this.data,
      ship = this.ship,
      types = this.types,
      target = this.target,
      actives = this.actives,
      cache = this.cache,
      data = this.data,
      length = actives.length,
      spawn = data.spawn,
      distance = engine.Point.distance(ship.position, targ);

  if(distance <= data.range) {

    // cooldown
    this.cooled = this.data.cooldown > 0 ? false : true;

    // intialize target
    target.copyFrom(targ);

    for(var i=0; i<length; i++) {
      launcher = actives[i];

      if(!launcher.isDone) {
        spawn--;
      }
      if(launcher.continue) {
        launcher.continue(target);
      }
    }

    for(var i=0; i<spawn; i++) {
      if(cache.length) {
        launcher = cache.pop();
      } else {
        launcher = new types[data.type](this);
      }
      launcher.start(target, distance, spawn, i, data.slot);
      actives.push(launcher);
    }
  }

  this.isRunning = true;
};

Hardpoint.prototype.hit = function(ship, target) {
  var launcher,
      rnd = this.game.rnd,
      actives = this.actives,
      length = actives.length;
      vector = ship.movement._vector,
      speed = ship.movement._speed

  for(var i=0; i<length; i++) {
    launcher = actives[i];
    launcher.hit && launcher.hit(ship, target);
  }

  this.explosionEmitter.medium(ship);
  this.explosionEmitter.at({ center: target });
  this.explosionEmitter.explode(1);

  this.explosionEmitter.small(ship);
  this.explosionEmitter.at({ center: target });
  this.explosionEmitter.explode(1);
  
  this.flashEmitter.attack(ship);
  this.flashEmitter.at({ center: target });
  this.flashEmitter.explode(1);
};

Hardpoint.prototype.update = function() {
  if(!this.isRunning) { return; }

  var launcher, key,
      remove = [],
      cache = this.cache,
      actives = this.actives,
      length = actives.length;

  for(var i=0; i<length; i++) {
    launcher = actives[i];

    if(launcher.isRunning || !launcher.isDone) {
      launcher.update();
    } else {
      remove.push(launcher);
    }
  }

  while(remove.length > 0) {
    launcher = remove.pop();
    // actives.splice(actives.indexOf(launcher), 1);
    engine.Utility.splice(actives, actives.indexOf(launcher));
    cache.push(launcher);
  }

  // stop
  if(length == 0) {
    this.isRunning = false;
  }
};

Hardpoint.prototype.updateTransform = function(target, distance) {
  var game = this.game,
      ship = this.ship,
      sprite = this.sprite,
      origin = this.origin,
      target = target || this.target,
      distance = distance || 18;

  // absolute origin
  ship.updateTransform();
  game.world.worldTransform.applyInverse(ship.worldTransform.apply(sprite), origin);
  distance && engine.Line.pointAtDistance({ x: origin.x, y: origin.y }, target, distance, origin);
  sprite.rotation = engine.Point.angle(origin, target)-ship.rotation;

  return origin;
};

Hardpoint.prototype.destroy = function() {
  var launcher,
      actives = this.actives;
  for(var i=0; i<this.actives.length; i++) {
    launcher = actives[i];
    launcher.destroy();
  }
  // destroy launchers in cache
  this.parent = this.game = this.ship =
    this.config = this.target = this.cap =
    this.position = this.sprite = this.launcher =
    this.data = undefined;
};

module.exports = Hardpoint;
