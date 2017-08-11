
var engine = require('engine'),
    Ship = require('./Ship'),
    pixi = require('pixi'),
    EnhancementManager = require('./EnhancementManager'),
    ExplosionEmitter = require('./emitters/ExplosionEmitter'),
    FlashEmitter = require('./emitters/FlashEmitter'),
    GlowEmitter = require('./emitters/GlowEmitter'),
    ShockwaveEmitter = require('./emitters/ShockwaveEmitter'),
    FireEmitter = require('./emitters/FireEmitter'),
    Indicator = require('./misc/Indicator');

function ShipManager(game) {
  this.game = game;
  this.clock = game.clock;
  this.net = game.net;
  this.socket = game.net.socket;
  this.shipNetManager = game.states.current.shipNetManager;
  this.enhancementManager = new EnhancementManager(this);

  // player
  this.player = null;

  // squad target
  this.acquired = null;

  // ship cache
  this.ships = {};

  // create indicator
  this.indicator = new Indicator(game);

  // create containers
  this.subGroup = new engine.Group(game);
  this.shipsGroup = new engine.Group(game);
  this.fxGroup = new engine.Group(game);
  this.trajectoryGroup = new engine.Group(game);

  // create emitters
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

  // add ships to world
  this.game.world.add(this.trajectoryGroup);
  this.game.world.add(this.subGroup);
  this.game.world.add(this.shipsGroup);
  this.game.world.add(this.fxGroup);
  this.game.world.add(this.fireEmitter);
  this.game.world.add(this.explosionEmitter);
  this.game.world.add(this.flashEmitter);
  this.game.world.add(this.shockwaveEmitter);
  this.game.world.add(this.glowEmitter);
  this.game.world.add(this.indicator);

  this.trajectoryGraphics = new engine.Graphics(game);
  this.trajectoryGroup.addChild(this.trajectoryGraphics);

  // authentication
  this.game.on('disconnected', this._disconnectd, this);

  // networking
  // TODO: move to ShipNetManager... maybe not?
  this.socket.on('ship/sync', this._syncBind = this._sync.bind(this));
  this.socket.on('ship/attack', this.attackBind = this._attack.bind(this));
  // this.socket.on('ship/test', this._test.bind(this));

  // subscribe to messages
  this.game.on('game/pause', this._pause, this);
  this.game.on('game/resume', this._resume, this);

  this.game.on('target/hostile', this._hostile, this)

  this.game.on('ship/player', this._player, this);
  this.game.on('ship/primary', this._primary, this);
  this.game.on('ship/secondary', this._secondary, this);
  this.game.on('ship/removed', this._removed, this);
  this.game.on('ship/disabled', this._disabled, this);
  this.game.on('ship/enabled', this._enabled, this);
  this.game.on('ship/hostile', this._hostile, this);
  this.game.on('ship/hardpoint/cooled', this._cooled, this);
};

ShipManager.prototype.constructor = ShipManager;

ShipManager.prototype.create = function(data, details) {
  var game = this.game,
      container = this.shipsGroup,
      ship = new Ship(this, details);

  ship.uuid = data.uuid;
  ship.user = details.user;
  ship.username = details.username;
  ship.position.set(data.pos.x, data.pos.y);

  // display
  container.add(ship);

  // boot
  ship.boot();

  //begin queen sounds
  if(ship.data.chassis === 'scavengers-x04d'){
    game.emit('ship/sound/growl', ship);
  }

  //save squadron to master ship
  if(this.player && ship.data.masterShip && ship.data.masterShip === this.player.uuid){
    this.player.squadron[ship.uuid] = ship;
  }

  return ship;
};

ShipManager.prototype.remove = function(data) {
  var game = this.game,
      camera = game.camera,
      ships = this.ships,
      ship = ships[data.uuid];
  if(ship !== undefined) {
    if(camera.target === ship) {
      camera.unfollow();
    }
    ship.destroy();
    delete ships[ship.uuid];
  }
};

ShipManager.prototype.removeAll = function() {
  var ship,
      ships = this.ships;
  for(var i=0; i<ships.length; i++) {
    ship = ships[s];
    this.remove(ship);
  };
};

ShipManager.prototype.destroy = function() {
  var game = this.game,
      auth = this.game.auth,
      socket = this.socket;

  auth.removeListener('disconnected', this._disconnectd);

  socket.removeListener('ship/sync', this._syncBind);
  socket.removeListener('ship/attack', this._attackBind);

  game.removeListener('ship/player', this._player);
  game.removeListener('ship/primary', this._primary);
  game.removeListener('ship/secondary', this._secondary);
  game.removeListener('ship/removed', this._removed);
  game.removeListener('ship/disabled', this._disabled);
  game.removeListener('ship/enabled', this._enabled);
  game.removeListener('game/pause', this._pause);
  game.removeListener('game/resume', this._resume);

  game.particles.remove(this.explosionEmitter);
  game.particles.remove(this.flashEmitter);
  game.particles.remove(this.glowEmitter);
  game.particles.remove(this.shockwaveEmitter);

  game.world.remove(this.trajectoryGroup);
  game.world.remove(this.shockwaveEmitter);
  game.world.remove(this.shipsGroup);
  game.world.remove(this.fxGroup);
  game.world.remove(this.explosionEmitter);
  game.world.remove(this.flashEmitter);
  game.world.remove(this.glowEmitter);

  this.game = this.socket = this._syncBind =
   this._attackBind = undefined;

  this.removeAll();
};

ShipManager.prototype._sync = function(data) {
  var ship, cached,
      game = this.game,
      ships = data.ships,
      length = ships.length,
      details, created, distance;
  for(var s=0; s<length; s++) {
    ship = ships[s];
    shipData = this.shipNetManager.getShipData(ship.uuid);

    if(shipData) {
      created = !this.ships[ship.uuid];
      cached = created ? this.ships[ship.uuid] = this.create(ship, shipData) : this.ships[ship.uuid];
      cached.movement.plot(ship);

      // if(cached.movement._speed > 0) {
      //   console.log(cached.movement._speed);
      
      //   this.trajectoryGraphics.lineStyle(0);
      //   this.trajectoryGraphics.beginFill(0x0000FF, 0.5);
      //   this.trajectoryGraphics.drawCircle(ship.pos.x, ship.pos.y, 6);
      //   this.trajectoryGraphics.endFill();
      // }
    }
  }
};

ShipManager.prototype._player = function(ship) {
  var ships = this.ships;
  for(var a in ships){
    if(ships[a].disabled){
      ships[a].chassis.tint = 0x333333;
    };
  };
  this.player = ship;
  this.player.unfriendlies = {};
  this.player.targetCount = 0;
  this.player.targetlistCooldown = false;
  this.player.previous;
  this.player.squadron = {};
  this.game.camera.follow(ship);
};

ShipManager.prototype._cooled = function(data) {
  this.player.targetingComputer.cooled(data);
};

ShipManager.prototype._attack = function(data) {
  var ship = this.ships[data.uuid],
      target = this.ships[data.target];

  if(ship != this.player) {
    ship.targetingComputer.attack(data);
  }
  // if(target){
  //   target.selector.something
  // }
}

// ShipManager.prototype._test = function(data) {
//   var ship = this.ships[data.uuid],
//       position = new engine.Point(ship.position.x, ship.position.y),
//       compensated = new engine.Point(data.compensated.x, data.compensated.y);

//   this.trajectoryGraphics.lineStyle(0);
//   this.trajectoryGraphics.beginFill(0x336699, 1.0);
//   this.trajectoryGraphics.drawCircle(position.x, position.y, 24);
//   this.trajectoryGraphics.endFill();

//   this.trajectoryGraphics.lineStyle(0);
//   this.trajectoryGraphics.beginFill(0x669933, 1.0);
//   this.trajectoryGraphics.drawCircle(data.targ.x, data.targ.y, 14);
//   this.trajectoryGraphics.endFill();

//   this.trajectoryGraphics.lineStyle(0);
//   this.trajectoryGraphics.beginFill(0x996633, 1.0);
//   this.trajectoryGraphics.drawCircle(compensated.x, compensated.y, 6);
//   this.trajectoryGraphics.endFill();
// };

ShipManager.prototype._primary = function(data) {
  var clock = this.clock,
      ship = this.player;
  if(ship) {
    if(!ship.disabled && data.type === 'start') {
      this.autofire && clock.events.remove(this.autofire);
      this.autofire = clock.events.loop(25, function() {
        ship.targetingComputer.fire();
      });
    } else {
      this.autofire && clock.events.remove(this.autofire);
    }
  }
};

ShipManager.prototype._secondary = function(data) {
  var game = this.game,
      ship = this.player,
      socket = this.socket,
      indicator = this.indicator,
      end = this.game.input.mousePointer,
      start = this.shipsGroup.worldTransform.apply(ship.position),
      position = this.game.world.worldTransform.applyInverse(end),
      destination = { x: end.x - start.x, y: end.y - start.y };
  // console.log(data)
    // console.log('front end destination is ', destination)
  if(ship) {
    if(data.shield){
      indicator.show(position);
      socket.emit('squad/shield', {
        uuid: ship.uuid,
        destination: {x: position.x, y: position.y }
      })
    }
    else if(data.type === 'start') {
      indicator.show(position);
      socket.emit('ship/plot', {
        uuid: ship.uuid,
        destination: destination
      });

      game.emit('ship/sound/thrusters');
    }
  }
};

ShipManager.prototype._disabled = function(data) {
  var ship = this.ships[data.uuid],
      socket = this.socket,
      clock = this.clock,
      othership;
  if(ship !== undefined) {
    ship.selector.hostileHighlightStop();
    ship.selector.hostileEngagedStop();
    ship.disable();
    this.game.emit('ship/sound/death', ship);
    // cancel autofire
    if(ship.isPlayer) {
      this.autofire && clock.events.remove(this.autofire);
      for(var a in this.ships){
        othership = this.ships[a];
        othership.selector.hostileHighlightStop();
        othership.selector.hostileEngagedStop();
      }
    };
    if(ship.data.chassis === 'scavengers-x04d') {
      for(var i = 0; i < ship.events.events.length; i++){
        if(ship.events.events[i].callback.name === 'growlTimer'){
          ship.events.remove(ship.events.events[i]);  
        }
      }
    };
  }
};

ShipManager.prototype._enabled = function(data) {
  var ship = this.ships[data.uuid];
  if(ship !== undefined) {
    ship.enable(data);
  }
};

ShipManager.prototype._removed = function(ship) {
  var tween,
      game = this.game,
      s = this.ships[ship.uuid];
  if(s !== undefined) {
    this.remove(ship);
  }
};

ShipManager.prototype._resume = function() {
  //..
};

ShipManager.prototype._pause = function() {
  //..
};

ShipManager.prototype._disconnectd = function() {
  this.removeAll();
};

module.exports = ShipManager;