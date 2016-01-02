
var engine = require('engine'),
    EventEmitter = require('eventemitter3'),
    Ship = require('./Ship'),
    Selection = require('./Selection'),
    ExplosionEmitter = require('./emitters/ExplosionEmitter'),
    FlashEmitter = require('./emitters/FlashEmitter'),
    GlowEmitter = require('./emitters/GlowEmitter'),
    ShockwaveEmitter = require('./emitters/ShockwaveEmitter');

function ShipManager(game) {
  EventEmitter.call(this);

  // initialize
  this.game = game;
  this.net = game.net;
  this.socket = game.net.socket;
  this.shipNetManager = game.shipNetManager;

  this.hudGroup = null;
  this.shipsGroup = new engine.Group(game);
  this.trajectoryGroup = new engine.Group(game);
  this.fxGroup = new engine.Group(game);
  this.fxGroup.blendMode = engine.BlendMode.ADD;

  this.trajectoryGraphics = new engine.Graphics(game);
  this.trajectoryGroup.addChild(this.trajectoryGraphics);

  this.selection = new Selection(this);

  this.explosionEmitter = new ExplosionEmitter(this.game);
  this.flashEmitter = new FlashEmitter(this.game);
  this.glowEmitter = new GlowEmitter(this.game);
  this.shockwaveEmitter = new ShockwaveEmitter(this.game);

  this.game.particles.add(this.explosionEmitter);
  this.game.particles.add(this.flashEmitter);
  this.game.particles.add(this.glowEmitter);
  this.game.particles.add(this.shockwaveEmitter);

  // ships
  this.ships = {};

  // add ships to world
  this.game.world.add(this.trajectoryGroup);
  this.game.world.add(this.shipsGroup);
  this.game.world.add(this.fxGroup);
  this.game.world.add(this.explosionEmitter);
  this.game.world.add(this.flashEmitter);
  this.game.world.add(this.shockwaveEmitter);
  this.game.world.add(this.glowEmitter);

  // authentication
  this.game.auth.on('disconnected', this._reset, this);

  // networking
  // TODO: move to ShipNetManager... maybe not?
  this.socket.on('ship/sync', this._syncBind = this._sync.bind(this));
  this.socket.on('ship/plotted', this._plottedBind = this._plotted.bind(this));

  // subscribe to messages
  this.game.on('ships/selected', this._select, this);
  this.game.on('ship/follow', this._follow, this);
  this.game.on('ship/targeted', this._targeted, this);
  this.game.on('ship/attack', this._attack, this);
  this.game.on('ship/destroyed', this._destroyed, this);
  this.game.on('enhancement/started', this._enstarted, this);
  this.game.on('enhancement/stopped', this._enstopped, this);
  this.game.on('game/pause', this._reset, this);
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

      if(created && cached.isPlayer) {
        this.game.emit('ship/follow', cached);
        this.game.emit('ships/selected', [cached]);
      }

      if(offset > 32 || created) {
        cached.rotation = ship.rotation;
        cached.position.set(ship.current.x, ship.current.y);
        // cached.movement.throttle = ship.throttle;

        if(ship.moving) {
          cached.movement.plot(ship.destination, ship.current, ship.previous);
        } else {
          cached.movement.animation.stop();
        }
      }
    }

    // if(!ship || !cached) { continue; }

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

ShipManager.prototype.create = function(data, details) {
  var game = this.game,
      ship = new Ship(this, details.chasis);

  ship.uuid = data.uuid;
  ship.user = details.user;
  ship.username = details.username;
  ship.details = details;
  ship.position.set(data.current.x, data.current.y);
  ship.rotation = data.rotation;
  ship.movement.throttle = data.throttle;
  ship.movement.trajectoryGraphics = this.trajectoryGraphics;

  ship.boot();

  this.shipsGroup.add(ship);

  return ship;
};

ShipManager.prototype.remove = function(ship) {
  var game = this.game,
      camera = game.camera,
      s = this.ships[ship.uuid];
  if(s !== undefined) {
    if(camera.target === s) {
      camera.unfollow();
    }
    delete this.ships[ship.uuid] && s.destroy();
  }
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

  socket.removeListener('ship/sync', this._syncBind);
  socket.removeListener('ship/plotted', this._plottedBind);
  
  game.removeListener('ships/selected', this._select);
  game.removeListener('ship/follow', this._follow);
  game.removeListener('ship/targeted', this._targeted);
  game.removeListener('ship/attack', this._attack);
  game.removeListener('ship/destroyed', this._destroyed);
  game.removeListener('enhancement/started', this._enstarted);
  game.removeListener('enhancement/stopped', this._enstopped);
  game.removeListener('game/pause', this._reset);

  this.selection.destroy();

  this.game.particles.remove(this.explosionEmitter);
  this.game.particles.remove(this.flashEmitter);
  this.game.particles.remove(this.glowEmitter);
  this.game.particles.remove(this.shockwaveEmitter);

  this.game.world.remove(this.trajectoryGroup);
  this.game.world.remove(this.shockwaveEmitter);
  this.game.world.remove(this.shipsGroup);
  this.game.world.remove(this.fxGroup);
  this.game.world.remove(this.explosionEmitter);
  this.game.world.remove(this.flashEmitter);
  this.game.world.remove(this.glowEmitter);

  this.game = this.socket = this._syncBind = 
    this._plottedBind = undefined;

  this.removeAll();
};

ShipManager.prototype._plotted = function(data) {
  var auth = this.game.auth,
      ship = this.ships[data.uuid],
      startTime = this.net.ping;
  if(ship !== undefined && !ship.isPlayer) {
    ship.rotation = data.rotation;
    ship.position.set(data.current.x, data.current.y);
    // ship.movement.throttle = data.throttle;
    ship.movement.plot(data.destination, data.current, data.previous);
  }
};

ShipManager.prototype._targeted = function(targeted) {
  var origin = this.ships[targeted.origin],
      target = this.ships[targeted.target];
  if(origin && target) {
    origin.target = target;
    target.targeted.push(origin);
  }
};

ShipManager.prototype._untargeted = function(targeted) {
  var ship, targeted,
      target = this.ships[targeted.uuid];
  if(target !== undefined) {
    targeted = target.targeted;
    for(var t in targeted) {
      ship = targeted[t];

      // remove target
      if(ship.target === target) {
        ship.target = null;
      }
    }
  }
};

ShipManager.prototype._attack = function(data) {
  var damage,
      origin = this.ships[data.origin],
      target = this.ships[data.target];
  if(origin && target) {
    if(!origin.target) { this._targeted(data); }
    if(data.type === 'evade') {
      target.hud.message('evading', 0xFFFFFF, 300, 5);
    } else if(data.type === 'miss') {
      target.hud.message('evading', 0xFFFFFF, 300, 5);
    } else {
      target.hud.message(data.damage.toString(), 0xFF0000, 200, 30, true);
      origin.targetingComputer.fire();
    }
  }
};

ShipManager.prototype._enstarted = function(data) {
  var ship = this.ships[data.ship];
      ship && ship.activate(data.enhancement);
};

ShipManager.prototype._enstopped = function(data) {
  var ship = this.ships[data.ship];
      ship && ship.deactivate(data.enhancement);
};

ShipManager.prototype._select = function(ships) {
  var ship, all = this.ships,
      player;
  for(var a in all) {
    ship = all[a];
    ship.deselect();
  }
  for(var s in ships) {
    ship = all[ships[s].uuid];
    ship && ship.select();
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
    s.target = null;
    s.damage.destroyed();
    s.data({ health: 0 });

    tween = game.tweens.create(s);
    tween.to({ alpha: 0 }, 2500, engine.Easing.Default, false, 12500);
    tween.once('complete', function() {
      this.remove(ship);
    }, this);
    tween.start();

    this.game.clock.events.add(1000, function() {
      this._untargeted(ship);
    }, this);
  }
};

ShipManager.prototype._reset = function() {
  this.removeAll();
};

module.exports = ShipManager;
