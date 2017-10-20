
var engine = require('engine'),
    Ship = require('./Ship'),
    EnhancementManager = require('./EnhancementManager'),
    Indicator = require('./misc/Indicator');

function ShipManager(game, state) {
  this.game = game;
  this.state = state;
  this.clock = game.clock;
  this.net = game.net;
  this.socket = game.net.socket;
  this.enhancementManager = new EnhancementManager(this);

  // player
  this.player = null;

  // ship cache
  this.ships = {};

  // create indicator
  this.indicator = new Indicator(game);

  // create containers
  this.subGroup = new engine.Group(game);
  this.shipsGroup = new engine.Group(game);
  this.fxGroup = new engine.Group(game);
  this.trajectoryGroup = new engine.Group(game);

  // add ships to world
  this.game.world.add(this.trajectoryGroup);
  this.game.world.add(this.subGroup);
  this.game.world.add(this.shipsGroup);
  this.game.world.add(this.fxGroup);
  this.game.world.add(this.indicator);

  this.trajectoryGraphics = new engine.Graphics(game);
  this.trajectoryGroup.addChild(this.trajectoryGraphics);

  // networking
  // this.socket.on('ship/test', this._test.bind(this));

  // subscribe to messages
  this.game.on('auth/disconnect', this._disconnect, this);

  this.game.on('sector/sync', this._sync, this);

  this.game.on('game/pause', this._pause, this);
  this.game.on('game/resume', this._resume, this);

  this.game.on('ship/player', this._player, this);
  this.game.on('ship/primary', this._primary, this);
  this.game.on('ship/secondary', this._secondary, this);
  this.game.on('ship/attack', this._attack, this);
  this.game.on('ship/removed', this._removed, this);
  this.game.on('ship/disabled', this._disabled, this);
  this.game.on('ship/enabled', this._enabled, this);
};

ShipManager.prototype.constructor = ShipManager;

ShipManager.prototype.create = function(data, sync) {
  var game = this.game,
      container = this.shipsGroup,
      ships = this.ships,
      ship = new Ship(this, data);

  // set data
  ship.uuid = data.uuid;
  ship.user = data.user;
  ship.username = data.username;

  // set position
  ship.position.set(sync.pos.x, sync.pos.y);

  // add ship registry
  ships[ship.uuid] = ship;

  // display
  container.add(ship);

  // boot
  ship.create();

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
  for(var s in ships) {
    this.remove(ships[s]);
  }
};

ShipManager.prototype.destroy = function() {
  var game = this.game,
      auth = this.game.auth,
      socket = this.socket;

  game.removeListener('auth/disconect', this._disconnect);
  game.removeListener('sector/sync', this._sync);
  game.removeListener('ship/player', this._player);
  game.removeListener('ship/primary', this._primary);
  game.removeListener('ship/secondary', this._secondary);
  game.removeListener('ship/removed', this._removed);
  game.removeListener('ship/disabled', this._disabled);
  game.removeListener('ship/enabled', this._enabled);
  game.removeListener('game/pause', this._pause);
  game.removeListener('game/resume', this._resume);

  game.world.remove(this.trajectoryGroup);
  game.world.remove(this.shipsGroup);
  game.world.remove(this.fxGroup);

  this.removeAll();

  this.game = this.socket = this._syncBind =
   this._attackBind = undefined;
};

ShipManager.prototype._sync = function(data) {
  var game = this.game,
      netManager = this.state.netManager,
      ships = data.ships,
      length = ships.length,
      sync, ship, d;
  for(var s=0; s<length; s++) {
    sync = ships[s];
    ship = this.ships[sync.uuid];

    if(ship) {
      ship.movement.plot(sync);
    } else {
      d = netManager.getShipData(sync.uuid);
      d && this.create(d, sync);
    }

    // this.trajectoryGraphics.lineStyle(0);
    // this.trajectoryGraphics.beginFill(0x0000FF, 0.5);
    // this.trajectoryGraphics.drawCircle(ship.pos.x, ship.pos.y, 6);
    // this.trajectoryGraphics.endFill();
  }
};

ShipManager.prototype._player = function(ship) {
  this.player = ship;
  this.game.camera.follow(ship);
};

ShipManager.prototype._attack = function(data) {
  var ship = this.ships[data.uuid];
  if(ship != this.player) {
    ship.targetingComputer.attack(data);
  }
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
      this.autofire = clock.events.loop(20, function() {
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
      end, start, position, destination, coordinates;

  if(ship) {
    end = this.game.input.mousePointer,
    position = this.game.world.worldTransform.applyInverse(end);
    coordinates = { x: position.x, y: position.y };

    if(data.type === 'start') {
      indicator.show(position);
      game.emit('ship/plot');
      socket.emit('ship/plot', {
        uuid: ship.uuid,
        coordinates: coordinates
      });
    }
  }
};

ShipManager.prototype._disabled = function(data) {
  var ship = this.ships[data.uuid],
      socket = this.socket,
      clock = this.clock,
      game = this.game;
  if(ship !== undefined) {
    ship.disable();
    ship.explode();

    if(ship.isPlayer) {
      this.autofire && clock.events.remove(this.autofire);
    }
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

ShipManager.prototype._disconnect = function() {
  this.removeAll();
};

module.exports = ShipManager;
