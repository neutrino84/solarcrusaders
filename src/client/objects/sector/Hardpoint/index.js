
var engine = require('engine'),
    pixi = require('pixi'),
    Energy = require('./Energy'),
    Projectile = require('./Projectile'),
    Pulse = require('./Pulse'),
    Missile = require('./Missile'),
    OutlineFilter = require('../../../fx/filters/OutlineFilter');

function Hardpoint(parent, config, data, slot, total) {
  this.parent = parent;
  this.game = parent.game;
  this.manager = parent.manager;
  this.state = parent.manager.state;
  this.ship = parent.ship;
  this.config = config;
  this.data = data;
  this.slot = slot;
  this.total = total;

  this.cache = [];
  this.actives = [];
  this.isRunning = false;
  this.rotation = 0;

  this.types = {
    projectile: Projectile,
    energy: Energy,
    pulse: Pulse,
    missile: Missile
  };

  this.target = new engine.Point();
  this.origin = new engine.Point();
  this.vector = new engine.Point();

  this.sprite = new engine.Sprite(this.game, 'texture-atlas', data.sprite + '.png');
  this.sprite.position.set(config.position.x, config.position.y);
  this.sprite.pivot.set(12, 12);
  
  this.ship.addChild(this.sprite);
};

Hardpoint.prototype.constructor = Hardpoint;

Hardpoint.prototype.fire = function(targ) {
  var launcher, origin,
      ship = this.ship,
      types = this.types,
      target = this.target,
      actives = this.actives,
      cache = this.cache,
      data = this.data,
      slot = this.slot,
      total = this.total,
      length = actives.length,
      spawn = data.spawn,
      created = [],
      distance = engine.Point.distance(ship.position, targ);

  if(distance <= data.range) {
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
    };

    for(var i=0; i<spawn; i++) {
      if(cache.length) {
        launcher = cache.pop();
      } else {
        launcher = new types[data.type](this);
      }
      launcher.start(target, distance, spawn, i, slot, total);
      created.push(launcher);
      actives.push(launcher);
    };

    this.game.emit('ship/hardpoint/fire', {
      ship: ship,
      target: target,
      distance: distance,
      actives: actives,
      created: created,
      spawn: spawn
    });
  };

  this.isRunning = true;
};

Hardpoint.prototype.hit = function(ship, target) {
  var launcher,
      game = this.game,
      actives = this.actives,
      state = this.state,
      s = this.ship,
      vector = this.vector.copyFrom(target),
      direction = ship.movement.direction,
      rnd = game.rnd,
      length = actives.length;

  // send hit to launchers
  for(var i=0; i<length; i++) {
    launcher = actives[i];
    launcher.hit && launcher.hit(ship, target);
  }

  s.events.repeat(50, 2, function() {
    vector.add(direction.x * 3, direction.y * 3);
    state.explosionEmitter.small();
    state.explosionEmitter.at({ center: vector });
    state.explosionEmitter.explode(1);
  });

  state.explosionEmitter.medium();
  state.explosionEmitter.at({ center: vector });
  state.explosionEmitter.explode(1);
  
  state.flashEmitter.attack();
  state.flashEmitter.at({ center: vector });
  state.flashEmitter.explode(1);

  game.emit('ship/hardpoint/hit', {
    ship: ship,
    target: target
  });
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
  this.game.world.worldTransform.applyInverse(ship.worldTransform.apply(this.sprite), origin);
  this.rotation = engine.Point.angle(origin, target);
  this.sprite.rotation = this.rotation - ship.rotation;

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
  this.parent = this.game = this.ship = this.manager =
    this.config = this.target = this.cap =
    this.position = this.sprite = this.launcher = undefined;
};

module.exports = Hardpoint;
