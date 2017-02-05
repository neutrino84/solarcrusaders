
var engine = require('engine'),
    Energy = require('./Energy'),
    Projectile = require('./Projectile'),
    Pulse = require('./Pulse');

function Hardpoint(parent, data, config) {
  this.parent = parent;
  this.game = parent.game;
  this.ship = parent.ship;
  this.config = config;
  this.data = data;

  this.isRunning = false;
  this.actives = [];
  this.types = {
    rocket: Projectile,
    energy: Energy,
    pulse: Pulse
  }

  this.target = new engine.Point();
  this.origin = new engine.Point();

  this.cap = new engine.Sprite(this.game, 'texture-atlas', 'turret-cap-' + this.ship.config.race + '.png');
  
  this.sprite = new engine.Sprite(this.game, 'texture-atlas', data.sprite + '.png');
  this.sprite.position.set(config.position.x, config.position.y);
  this.sprite.pivot.set(config.pivot.x, config.pivot.y);
  
  this.ship.addChild(this.sprite);
  this.sprite.addChild(this.cap);

  if(config.type && config.type.indexOf('projectile') >= 0) {
    this.sprite.visible = false;
  }
};

Hardpoint.prototype.constructor = Hardpoint;

Hardpoint.prototype.fire = function(targ) {
  var delay, launcher,
      data = this.data,
      ship = this.ship,
      types = this.types,
      target = this.target,
      actives = this.actives,
      length = actives.length,
      spawn = data.spawn,
      distance = engine.Point.distance(ship.position, targ);

  if(distance <= data.range) {
    target.copyFrom(targ);

    for(var i=0; i<length; i++) {
      launcher = actives[i];

      if(!launcher.isDone) {
        spawn--;
      }
    }

    for(var i=0; i<spawn; i++) {
      delay = (global.Math.random() * data.delay);

      launcher = new types[data.type](this);
      launcher.start(target, distance, delay);

      actives.push(launcher);
    }
  }

  this.isRunning = true;
};

Hardpoint.prototype.hit = function(ship) {
  var launcher,
      actives = this.actives,
      length = actives.length;
  for(var i=0; i<length; i++) {
    launcher = actives[i];
    launcher.hit && launcher.hit(ship);
  }
};

Hardpoint.prototype.update = function() {
  if(!this.isRunning) { return; }

  var launcher,
      remove = [],
      actives = this.actives,
      length = actives.length;

  for(var i=0; i<length; i++) {
    launcher = actives[i];
    
    if(launcher.isRunning) {
      launcher.update();
    } else {
      launcher.destroy();
      remove.push(launcher);
    }
  }

  while(remove.length > 0) {
    launcher = remove.pop();
    actives.splice(actives.indexOf(launcher), 1);
  }

  // stop
  if(length == 0) {
    this.isRunning = false;
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
      manager.explosionEmitter.explode(1);

      if(ship.isPlayer) {
        game.camera.shake();
        parent.highlight();
      }
    }
  }, this);
};

Hardpoint.prototype.updateTransform = function(target) {
  var game = this.game,
      ship = this.ship,
      sprite = this.sprite,
      origin = this.origin,
      target = target || this.target;

  // absolute origin
  ship.updateTransform();
  game.world.worldTransform.applyInverse(ship.worldTransform.apply(sprite), origin);
  engine.Line.pointAtDistance({ x: origin.x, y: origin.y }, target, 18, origin);
  sprite.rotation = engine.Point.angle(origin, target)-ship.rotation;

  return origin;
};

Hardpoint.prototype.destroy = function() {
  this.parent = this.game = this.ship =
    this.config = this.target = this.cap =
    this.position = this.sprite = this.launcher =
    this.data = undefined;
};

module.exports = Hardpoint;
