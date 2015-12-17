
var engine = require('engine'),
    EventEmitter = require('eventemitter3'),
    Ship = require('./Ship'),
    ExplosionEmitter = require('./emitters/ExplosionEmitter'),
    FlashEmitter = require('./emitters/FlashEmitter'),
    GlowEmitter = require('./emitters/GlowEmitter');

function ShipManager(game) {
  EventEmitter.call(this);

  // initialize
  this.game = game;
  this.net = game.net;
  this.socket = game.net.socket;
  this.shipNetManager = game.shipNetManager;

  this.labelsGroup = null;
  this.shipsGroup = new engine.Group(game);
  this.trajectoryGroup = new engine.Group(game);
  this.fxGroup = new engine.Group(game);
  this.fxGroup.blendMode = engine.BlendMode.ADD;

  // trajectoryGraphics
  this.trajectoryGraphics = new engine.Graphics(game);
  this.trajectoryGroup.addChild(this.trajectoryGraphics);

  this.explosionEmitter = new ExplosionEmitter(this.game);
  this.flashEmitter = new FlashEmitter(this.game);
  this.glowEmitter = new GlowEmitter(this.game);

  this.game.particles.add(this.explosionEmitter);
  this.game.particles.add(this.flashEmitter);
  this.game.particles.add(this.glowEmitter);

  // ships
  this.ships = {};

  // add ships to world
  this.game.world.add(this.trajectoryGroup);
  this.game.world.add(this.shipsGroup);
  this.game.world.add(this.fxGroup);
  this.game.world.add(this.explosionEmitter);
  this.game.world.add(this.flashEmitter);
  this.game.world.add(this.glowEmitter);

  // authentication
  this.game.auth.on('disconnected', this._disconnected, this);

  // networking
  // TODO: move to client/net/Sector.js... maybe not? (ShipNetManager)
  this.socket.on('ship/sync', this._syncBind = this._sync.bind(this));
  this.socket.on('ship/plotted', this._plottedBind = this._plotted.bind(this));
  this.socket.on('ship/destroyed', this._destroyedBind = this._destroyed.bind(this));

  // subscribe to messages
  this.game.on('gui/selected', this._selected, this);
  this.game.on('ships/selected', this._select, this);
  this.game.on('ship/follow', this._follow, this);
  this.game.on('ship/targeted', this._targeted, this);
  this.game.on('ship/untargeted', this._untargeted, this);
  this.game.on('ship/attack', this._attack, this);
}

ShipManager.prototype = Object.create(EventEmitter.prototype);
ShipManager.prototype.constructor = ShipManager;

ShipManager.prototype._sync = function(data) {
  var ship, cached, offset,
      ships = data.ships,
      length = ships.length,
      details, created;
  for(var s=0; s<length; s++) {
    ship = ships[s];
    
    // load ship details
    details = this.shipNetManager.getShipDataByUuid(ship.uuid);

    if(details) {
      created = !this.ships[ship.uuid];
      cached = this.ships[ship.uuid] ? this.ships[ship.uuid] : this.ships[ship.uuid] = this.create(ship, details);
      offset = engine.Point.distance(ship.current, cached.movement.current);

      if(created && cached.user === game.auth.user.uuid) {
        this.game.emit('ship/follow', cached);
        this.game.emit('ships/selected', [cached]);
      }

      if(offset > 64 || created) {
        cached.rotation = ship.rotation;
        cached.position.set(ship.current.x, ship.current.y);
        cached.movement.throttle = ship.throttle;

        if(ship.moving) {
          cached.movement.plot(ship.destination, ship.current, ship.previous);
          // if(!cached.movement.valid) {
          //   console.log('plot linear');
          //   cached.movement.plotLinear(ship.destination, ship.current, ship.previous);
          // }
          // cached.movement.drawData();
        } else {
          cached.movement.animation.stop();
        }
      }
    }

    // this.trajectoryGraphics.lineStyle(0);
    // this.trajectoryGraphics.beginFill(0x00FF00, 1.0)
    // this.trajectoryGraphics.drawCircle(cached.position.x, cached.position.y, 4);
    // this.trajectoryGraphics.endFill();

    // this.trajectoryGraphics.lineStyle(0);
    // this.trajectoryGraphics.beginFill(0xFF0000, 1.0)
    // this.trajectoryGraphics.drawCircle(ship.current.x, ship.current.y, 2);
    // this.trajectoryGraphics.endFill();

    // var frame = cached.movement.animation.frame;
    // if(frame) {
    //   this.trajectoryGraphics.lineStyle(0);
    //   this.trajectoryGraphics.beginFill(0x00FF00, 1.0)
    //   this.trajectoryGraphics.drawCircle(frame.x, frame.y, 4);
    //   this.trajectoryGraphics.endFill();

    //   this.trajectoryGraphics.lineStyle(0);
    //   this.trajectoryGraphics.beginFill(0xFF0000, 1.0)
    //   this.trajectoryGraphics.drawCircle(ship.current.x, ship.current.y, 2);
    //   this.trajectoryGraphics.endFill();
    // }
  }
};

ShipManager.prototype.update = function() {

};

ShipManager.prototype.create = function(data, details) {
  var game = this.game,

      ship = new Ship(this, details.chasis);
      
      ship.uuid = data.uuid;
      ship.user = details.user;
      ship.username = details.username;

      ship.boot();

      ship.movement.throttle = data.throttle;
      ship.position.set(data.current.x, data.current.y);
      ship.rotation = data.rotation;
      ship.trajectoryGraphics = this.trajectoryGraphics;

  this.shipsGroup.add(ship);

  return ship;
};

ShipManager.prototype.remove = function(ship) {
  var game = this.game;
      s = this.ships[ship.uuid],
      camera = game.camera;
      game.emit('ship/untargeted', ship);
  if(camera.target === s) {
    camera.unfollow();
  }
  delete this.ships[ship.uuid] && s.destroy();
};

ShipManager.prototype.removeAll = function() {
  var ship,
      ships = this.ships,
      camera = this.game.camera;

  // unfollow
  camera.unfollow();

  // remove all ships
  for(var s in ships) {
    this.remove(ships[s]);
  }
};

ShipManager.prototype.destroy = function() {
  var game = this.game,
      auth = this.game.auth,
      socket = this.socket;

  auth.removeListener('disconnected', this._disconnected);
  
  game.removeListener('gui/selected', this._selected);
  game.removeListener('ships/selected', this._select);
  game.removeListener('ship/follow', this._follow);
  game.removeListener('ship/targeted', this._targeted);
  game.removeListener('ship/untargeted', this._untargeted);
  game.removeListener('ship/attack', this._attack);

  socket.removeListener('ship/sync', this._syncBind);
  socket.removeListener('ship/plotted', this._plottedBind);
  socket.removeListener('ship/destroyed', this._destroyedBind);

  this.game = this.socket =
    this._syncBind = this._plottedBind =
    this._destroyedBind = undefined;

  this.removeAll();
};

ShipManager.prototype._plotted = function(data) {
  var auth = this.game.auth,
      ship = this.ships[data.uuid],
      startTime = this.net.ping;
  if(ship !== undefined && ship.user !== auth.user.uuid) {
    ship.rotation = data.rotation;
    ship.position.set(data.current.x, data.current.y);
    ship.movement.throttle = data.throttle;
    ship.movement.plot(data.destination, data.current, data.previous);
  }
};

ShipManager.prototype._targeted = function(targeted) {
  var origin = this.ships[targeted.origin],
      target = this.ships[targeted.target];
  if(origin && target) {
    origin.target = target;
  }
};

ShipManager.prototype._untargeted = function(targeted) {
  var ship,
      ships = this.ships,
      target = this.ships[targeted.uuid];
  for(var s in ships) {
    ship = ships[s];

    // remove target
    if(ship.target === target) {
      ship.target = null;
    }
  }
};

ShipManager.prototype._attack = function(data) {
  var ship = this.ships[data.origin];
  if(ship) {
    ship.target = this.ships[data.target];
    ship.targetingComputer.fire();
  }
};

ShipManager.prototype._select = function(ships) {
  var ship, all = this.ships;
  for(var a in all) {
    ship = all[a];
    ship.deselect();
  }
  for(var s in ships) {
    ship = all[ships[s].uuid];
    if(ship !== undefined) {
      ship.select();
    }
  }
};

ShipManager.prototype._follow = function(data) {
  var game = this.game,
      ship = this.ships[data.uuid];
  if(ship !== undefined) {
    game.camera.follow(ship);
    game.input.once('keydown', function() {
      game.camera.unfollow();
    }, this);
  }
};

ShipManager.prototype._destroyed = function(ship) {
  var tween,
      game = this.game,
      s = this.ships[ship.uuid];
  if(s !== undefined) {
    s.damage.destroyed();
    tween = game.tweens.create(s);
    tween.to({ alpha: 0 }, 5000, engine.Easing.Default, false, 15000);
    tween.once('complete', function() {
      this.remove(ship);
    }, this);
    tween.start();
  }
};

ShipManager.prototype._disconnected = function() {
  this.removeAll();
};

ShipManager.prototype._selected = function(pointer, rectangle) {
  var point, ship,
      select = [],
      selected = [];

  this.shipsGroup.forEach(function(child) {
    if(pointer.button === engine.Mouse.LEFT_BUTTON) {
      if(child.overlap(rectangle)) {
        select.push(child);
      } else if(child.isPlayer) {
        select.push(child);
      }
    }
    if(pointer.button === engine.Mouse.RIGHT_BUTTON) {
      if(child.selected && rectangle.volume <= 300) {
        selected.push(child);
      }
    }
  });

  // always update
  if(pointer.button === engine.Mouse.LEFT_BUTTON) {
    this.game.emit('ships/selected', select);
  }

  if(selected.length > 0) {
    point = game.world.worldTransform.applyInverse(rectangle);
    
    this.trajectoryTween && this.trajectoryTween.stop();
    this.trajectoryGraphics.clear();
    this.trajectoryGraphics.alpha = 1.0;

    for(var i=0; i<selected.length; i++) {
      ship = selected[i];
      if(ship.isPlayer && !ship.destroyed) {
        ship.movement.plot(point);
        this.socket.emit('ship/plot', {
          uuid: ship.uuid,
          destination: point
        });

        if(ship.movement.valid) {
          ship.movement.drawDebug();
        }
      }
    }

    this.trajectoryTween = this.game.tweens.create(this.trajectoryGraphics);
    this.trajectoryTween.to({ alpha: 0.0 }, 500, engine.Easing.Quadratic.InOut);
    this.trajectoryTween.start();
  }
};

module.exports = ShipManager;
