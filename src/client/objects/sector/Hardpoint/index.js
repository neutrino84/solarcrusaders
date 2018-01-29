
var engine = require('engine'),
    Energy = require('./Energy'),
    Projectile = require('./Projectile'),
    Pulse = require('./Pulse'),
    Missile = require('./Missile'),
    OutlineFilter = require('../../../fx/filters/OutlineFilter');

function Hardpoint(parent, config, data, slot, total) {
  this.parent = parent;
  this.game = parent.game;
  this.manager = parent.manager;
  this.ship = parent.ship;
  this.config = config;
  this.data = data;
  this.slot = slot;
  this.total = total;

  this.actives = [];
  this.launchers = [];

  this.types = {
    projectile: Projectile,
    energy: Energy,
    pulse: Pulse,
    missile: Missile
  };

  this.vector = new engine.Point();

  this.sprite = new engine.Sprite(this.game, 'texture-atlas', data.sprite + '.png');
  this.sprite.position.set(config.position.x, config.position.y);
  this.sprite.pivot.set(12, 12);
  
  this.ship.addChild(this.sprite);
};

Hardpoint.prototype.constructor = Hardpoint;

Hardpoint.prototype.fire = function(target) {
  var game = this.game,
      ship = this.ship,
      data = this.data,
      types = this.types,
      sprite = this.sprite,
      actives = this.actives,
      launchers = this.launchers,
      spawn = data.spawn,
      distance, launcher;
  
  // compute distance to target
  distance = engine.Point.distance(target, ship.position);

  // intialize launchers
  if(data.range > distance) {
    for(var i=0; i<actives.length; i++) {
      launcher = actives[i];

      if(!launcher.multiple) {
        spawn--;
      }
    };

    // get launcher
    for(var index=0; index<spawn; index++) {
      if(launchers.length) {
        launcher = launchers.pop();
      } else {
        launcher = new types[data.type](this);
      }

      // start launcher
      launcher.start(target, distance, index);
      
      // activate luancher
      actives.push(launcher);
    }

    // // notify listeners
    // game.emit('ship/hardpoint/fire', {
    //   ship: ship,
    //   target: target,
    //   distance: distance,
    //   data: data
    // });
  }
};

Hardpoint.prototype.update = function() {
  var launcher,
      remove = [],
      indexes = [],
      actives = this.actives,
      launchers = this.launchers,
      utility = engine.Utility;

  for(var i=0; i<actives.length; i++) {
    launcher = actives[i];

    if(launcher.isRunning) {
      launcher.update();
    } else {
      remove.push(launcher);
    }
  }

  while(remove.length > 0) {
    // cache launcher
    launcher = remove.pop();
    launchers.push(launcher);
    
    // remove from actives
    utility.splice(actives, actives.indexOf(launcher));
  }
};

Hardpoint.prototype.hit = function(ship, target) {
  var launcher,
      game = this.game,
      actives = this.actives,
      vector = this.vector,
      emitters = this.game.emitters,
      position = ship.movement.position,
      direction = ship.movement.direction,
      length = actives.length;

  // send hit to launchers
  for(var i=0; i<length; i++) {
    launcher = actives[i];
    launcher.hit && launcher.hit(ship, target);
  }

  vector.set(direction.x, direction.y);
  game.emitters.explosion.small();
  game.emitters.explosion.at({ center: { x: vector.x + target.x, y: vector.y + target.y } });
  game.emitters.explosion.explode(1);

  ship.events.repeat(50, 3, function() {
    vector.add(direction.x*3, direction.y*3);
    
    game.emitters.explosion.small();
    game.emitters.explosion.at({ center: { x: vector.x + target.x, y: vector.y + target.y } });
    game.emitters.explosion.explode(1);
  });
   
  game.emitters.explosion.medium();
  game.emitters.explosion.at({ center: target });
  game.emitters.explosion.explode(1);

  game.emitters.flash.attack();
  game.emitters.flash.at({ center: target });
  game.emitters.flash.explode(1);

  // game.emit('ship/hardpoint/hit', {
  //   ship: ship,
  //   target: target
  // });
};

Hardpoint.prototype.updateTransform = function(origin, target) {
  var game = this.game,
      ship = this.ship,
      sprite = this.sprite;
  game.world.worldTransform.applyInverse(ship.worldTransform.apply(sprite), origin);
  sprite.rotation = engine.Point.angle(origin, target) - ship.rotation;
};

Hardpoint.prototype.destroy = function() {
  var launcher,
      actives = this.actives;

  // destroy launchers
  for(var i=0; i<this.actives.length; i++) {
    launcher = actives[i];
    launcher.destroy();
  }

  // destroy launchers in launchers
  this.parent = this.game = this.ship = this.manager =
    this.config = this.cap =
    this.sprite = this.launcher = undefined;
};

module.exports = Hardpoint;
