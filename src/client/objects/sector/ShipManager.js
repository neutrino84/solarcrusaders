
var engine = require('engine'),
    EventEmitter = require('eventemitter3'),
    Ship = require('./Ship'),
    ExplosionEmitter = require('./emitters/ExplosionEmitter'),
    FlashEmitter = require('./emitters/FlashEmitter'),
    GlowEmitter = require('./emitters/GlowEmitter'),
    ShockwaveEmitter = require('./emitters/ShockwaveEmitter'),
    FireEmitter = require('./emitters/FireEmitter');

function ShipManager(game) {
  EventEmitter.call(this);

  // initialize
  this.game = game;
  this.net = game.net;
  this.socket = game.net.socket;
  this.shipNetManager = game.shipNetManager;

  this.forceReposition = false;

  this.hudGroup = null;
  this.shipsGroup = new engine.Group(game);
  this.trajectoryGroup = new engine.Group(game);
  this.fxGroup = new engine.Group(game);
  this.fxGroup.blendMode = engine.BlendMode.ADD;

  this.trajectoryGraphics = new engine.Graphics(game);
  this.trajectoryGroup.addChild(this.trajectoryGraphics);

  this.explosionEmitter = new ExplosionEmitter(this.game);
  this.flashEmitter = new FlashEmitter(this.game);
  this.glowEmitter = new GlowEmitter(this.game);
  this.shockwaveEmitter = new ShockwaveEmitter(this.game);
  this.fireEmitter = new FireEmitter(this.game);

  this.game.particles.add(this.explosionEmitter);
  this.game.particles.add(this.flashEmitter);
  this.game.particles.add(this.glowEmitter);
  this.game.particles.add(this.shockwaveEmitter);
  this.game.particles.add(this.fireEmitter);

  // ships
  this.ships = {};

  // add ships to world
  this.game.world.add(this.trajectoryGroup);
  this.game.world.add(this.shipsGroup);
  this.game.world.add(this.fxGroup);
  this.game.world.add(this.fireEmitter);
  this.game.world.add(this.explosionEmitter);
  this.game.world.add(this.shockwaveEmitter);
  this.game.world.add(this.glowEmitter);
  this.game.world.add(this.flashEmitter);

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
  this.game.on('ship/removed', this._removed, this);
  this.game.on('ship/disabled', this._disabled, this);
  this.game.on('enhancement/started', this._enstarted, this);
  this.game.on('enhancement/stopped', this._enstopped, this);
  this.game.on('game/pause', this._reset, this);
  this.game.on('game/resume', this._resume, this);
};

ShipManager.prototype = Object.create(EventEmitter.prototype);
ShipManager.prototype.constructor = ShipManager;

ShipManager.prototype._sync = function(data) {
  var ship, cached, offset,
      game = this.game,
      ships = data.ships,
      length = ships.length,
      details, created, distance;
  for(var s=0; s<length; s++) {
    ship = ships[s];
    
    // load ship details
    details = this.shipNetManager.getShipData(ship.uuid);

    if(details) {
      created = !this.ships[ship.uuid];
      cached = this.ships[ship.uuid] ? this.ships[ship.uuid] : this.ships[ship.uuid] = this.create(ship, details);
      offset = engine.Point.distance(ship.current, cached.movement.current);

      if(created && cached.isPlayer) {
        game.emit('ship/follow', cached);
        game.emit('ships/selected', [cached]);
      }

      if(this.forceReposition) {
        cached.position.set(ship.current.x, ship.current.y);
      }
      
      if(offset > 64 || created) {
        // cached.rotation = ship.rotation;
        // cached.movement.throttle = ship.throttle;        
        
        if(ship.moving) { 
          if(created) {
            cached.movement.plot(ship.destination, ship.current, ship.previous);
          }
        } else {
          cached.movement.animation.stop();
          cached.position.set(ship.current.x, ship.current.y);
        }
      }

      // if(cached.isPlayer) {
      //   this.trajectoryGraphics.lineStyle(0);
      //   this.trajectoryGraphics.beginFill(0x0000FF, 0.5)
      //   this.trajectoryGraphics.drawCircle(cached.movement.current.x, cached.movement.current.y, 6);
      //   this.trajectoryGraphics.endFill();

      //   this.trajectoryGraphics.lineStyle(0);
      //   this.trajectoryGraphics.beginFill(0x00FF00, 0.75)
      //   this.trajectoryGraphics.drawCircle(cached.position.x, cached.position.y, 4);
      //   this.trajectoryGraphics.endFill();

      //   this.trajectoryGraphics.lineStyle(0);
      //   this.trajectoryGraphics.beginFill(0xFF0000, 1.0)
      //   this.trajectoryGraphics.drawCircle(ship.current.x, ship.current.y, 2);
      //   this.trajectoryGraphics.endFill();
      // }
    }
  }
  this.forceReposition = false;
};

ShipManager.prototype.focus = function() {
  this.game.input.on('keydown', this._unfollow, this);
};

ShipManager.prototype.blur = function() {
  this.game.input.removeListener('keydown', this._unfollow);
};

ShipManager.prototype.create = function(data, details) {
  var game = this.game,
      ship = new Ship(this, details.chassis);

  ship.uuid = data.uuid;
  ship.user = details.user;
  ship.username = details.username;
  ship.details = details;
  ship.position.set(data.current.x, data.current.y);
  ship.rotation = data.rotation;
  ship.movement.throttle = data.throttle;

  this.shipsGroup.add(ship);

  ship.boot();

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
  var ships = this.ships;
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
  game.removeListener('ship/removed', this._removed);
  game.removeListener('ship/disabled', this._disabled);
  game.removeListener('enhancement/started', this._enstarted);
  game.removeListener('enhancement/stopped', this._enstopped);
  game.removeListener('game/pause', this._reset);
  game.removeListener('game/resume', this._resume);

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
      rtt = this.net.rtt;
  if(ship !== undefined && !ship.isPlayer) {
    // ship.rotation = data.rotation;
    // ship.movement.throttle = data.throttle;
    ship.movement.plot(data.destination, data.current, data.previous);
  }
};

ShipManager.prototype._targeted = function(data) {
  var origin = this.ships[data.origin],
      target = this.ships[data.target];
  if(origin && target) {
    origin.target = target;
    origin.targetingComputer.cancel();
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
    if(data.type !== 'miss') {
      target.renderable && target.hud.flash(data.damage.toString(), 0xFF0000, 300, 30, true);

      if(origin.renderable || target.renderable) {
        origin.targetingComputer.fire();
      }
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
  }
};

ShipManager.prototype._unfollow = function() {
  this.game.camera.unfollow();
};

ShipManager.prototype._disabled = function(data) {
  var tween,
      game = this.game,
      target = this.ships[data.target];
  if(target !== undefined) {
    target.damage.destroyed();
    target.disabled();
    this.game.clock.events.add(1000, function() {
      this._untargeted(target);
    }, this);
  }
};

ShipManager.prototype._removed = function(ship) {
  var tween,
      game = this.game,
      s = this.ships[ship.uuid];
  if(s !== undefined) {
    s.disabled();

    tween = game.tweens.create(s);
    tween.to({ alpha: 0 }, 2500, engine.Easing.Default, true, 5000);
    tween.once('start', function() {
      this._untargeted(ship);
    }, this);
    tween.once('complete', function() {
      this.remove(ship);
    }, this);
  }
};

ShipManager.prototype._resume = function() {
  this.forceReposition = true;
};

ShipManager.prototype._reset = function() {
  this.removeAll();
};

module.exports = ShipManager;
