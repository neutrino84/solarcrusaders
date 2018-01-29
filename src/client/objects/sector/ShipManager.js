
var engine = require('engine'),
    Ship = require('./Ship'),
    Indicator = require('./misc/Indicator');

function ShipManager(game) {
  this.game = game;
  this.clock = game.clock;
  this.net = game.net;
  this.socket = game.net.socket;

  // player
  this.player = null;

  // ship cache
  this.game.ships = {};

  // create indicator
  this.indicator = new Indicator(game);

  // create containers
  this.fxGroup = new engine.Group(game);
  this.subGroup = new engine.Group(game);
  this.shipsGroup = new engine.Group(game);
  // this.trajectoryGroup = new engine.Group(game);

  // add ships to world
  // this.game.world.add(this.trajectoryGroup);
  this.game.world.add(this.subGroup);
  this.game.world.add(this.shipsGroup);
  this.game.world.add(this.fxGroup);
  this.game.world.add(this.indicator);

  // this.trajectoryGraphics = new engine.Graphics(game);
  // this.trajectoryGroup.addChild(this.trajectoryGraphics);

  // subscribe to messages
  this.game.on('auth/disconnect', this.disconnect, this);
  this.game.on('sector/sync', this.syncronize, this);
  this.game.on('ship/user', this.user, this);
  this.game.on('ship/create', this.create, this);
  this.game.on('ship/remove', this.remove, this);
  this.game.on('ship/primary', this.primary, this);
  this.game.on('ship/secondary', this.secondary, this);
  this.game.on('ship/attack', this.attack, this);
  // this.socket.on('ship/test', this.test.bind(this));
};

ShipManager.prototype.constructor = ShipManager;

ShipManager.prototype.create = function(data) {
  var game = this.game,
      shipsGroup = this.shipsGroup,
      ship = new Ship(this, data);

  // create
  ship.create();
  shipsGroup.add(ship);
  game.ships[ship.uuid] = ship;

  // set player
  ship.isPlayer && game.emit('ship/user', ship);
};

ShipManager.prototype.user = function(ship) {
  // player ship
  this.player = ship;

  // update camera
  this.game.camera.focus(ship.x, ship.y);
  this.game.camera.follow(ship);
};

ShipManager.prototype.remove = function(data) {
  var game = this.game,
      player = this.player,
      camera = game.camera,
      ship = game.ships[data.uuid];
  if(ship !== undefined) {
    if(ship === player) {
      this.player = null;
    }
    
    // update camera
    if(camera.target === ship) {
      camera.unfollow();
    }
    
    // remove 
    ship.remove();

    // ship reference
    delete game.ships[ship.uuid];
  }
};

ShipManager.prototype.removeAll = function() {
  var game = this.game,
      ships = game.ships,
      ship;
  for(var s in ships) {
    this.remove(ships[s]);
  }
};

ShipManager.prototype.syncronize = function(data) {
  var game = this.game,
      syncronize = data.ships,
      sync, ship;
  for(var s=0; s<syncronize.length; s++) {
    sync = syncronize[s];
    ship = game.ships[sync.uuid];
    ship && ship.movement.plot(sync);

    // // movement tester
    // this.trajectoryGraphics.lineStyle(0);
    // this.trajectoryGraphics.beginFill(0xFFFFFF, 1.0);
    // this.trajectoryGraphics.drawCircle(sync.pos.x, sync.pos.y, 14);
    // this.trajectoryGraphics.endFill();
    
    // this.trajectoryGraphics.lineStyle(0);
    // this.trajectoryGraphics.beginFill(0xFF0033, 1.0);
    // this.trajectoryGraphics.drawCircle(sync.cmp.x, sync.cmp.y, 10);
    // this.trajectoryGraphics.endFill();
    
    // if(ship) {
    //   this.trajectoryGraphics.lineStyle(0);
    //   this.trajectoryGraphics.beginFill(0x0000FF, 1.0);
    //   this.trajectoryGraphics.drawCircle(ship.x, ship.y, 6);
    //   this.trajectoryGraphics.endFill();
    // }
  }
};

ShipManager.prototype.attack = function(data) {
  var game = this.game,
      player = this.player,
      ship = game.ships[data.uuid];
  if(ship != undefined && ship != player) {
    ship.targetingComputer.attack(data);
  }
};

ShipManager.prototype.test = function(data) {
  var game = this.game,
      ship = game.ships[data.uuid],
      position = new engine.Point(ship.position.x, ship.position.y),
      compensated = new engine.Point(data.compensated.x, data.compensated.y);

  // this.trajectoryGraphics.lineStyle(0);
  // this.trajectoryGraphics.beginFill(0x0000ff, 1.0);
  // this.trajectoryGraphics.drawCircle(position.x, position.y, 8);
  // this.trajectoryGraphics.endFill();

  // // this.trajectoryGraphics.lineStyle(0);
  // // this.trajectoryGraphics.beginFill(0xff0000, 1.0);
  // // this.trajectoryGraphics.drawCircle(data.targ.x, data.targ.y, 8);
  // // this.trajectoryGraphics.endFill();

  // this.trajectoryGraphics.lineStyle(0);
  // this.trajectoryGraphics.beginFill(0x00ff00, 1.0);
  // this.trajectoryGraphics.drawCircle(compensated.x, compensated.y, 8);
  // this.trajectoryGraphics.endFill();
};

ShipManager.prototype.primary = function(data) {
  var targetingComputer,
      clock = this.clock,
      player = this.player;
  if(player) {
    targetingComputer = player.targetingComputer;

    if(!player.disabled && data.type === 'start') {
      // initial shot
      targetingComputer.fired();

      // autofire
      this.autofire && clock.events.remove(this.autofire);
      this.autofire = clock.events.loop(
        player.data.rate,
        targetingComputer.fired,
        targetingComputer);
    } else {
      this.autofire && clock.events.remove(this.autofire);
    }
  }
};

ShipManager.prototype.secondary = function(data) {
  var game = this.game,
      player = this.player,
      socket = this.socket,
      indicator = this.indicator,
      end, start, position, coordinates;
  if(player) {
    end = game.input.mousePointer,
    position = game.world.worldTransform.applyInverse(end);
    coordinates = { x: position.x, y: position.y };

    if(data.type === 'start') {
      indicator.show(position);
      socket.emit('ship/plot', {
        uuid: player.uuid,
        coordinates: coordinates
      });
    }
  }
};

ShipManager.prototype.destroy = function() {
  var game = this.game,
      world = game.world;

  // remove event listeners
  game.removeListener('auth/disconect', this.disconnect);
  game.removeListener('sector/sync', this.syncronize);
  game.removeListener('ship/primary', this.primary);
  game.removeListener('ship/secondary', this.secondary);
  game.removeListener('ship/remove', this.remove);

  // remove containers
  world.remove(this.trajectoryGroup);
  world.remove(this.subGroup);
  world.remove(this.shipsGroup);
  world.remove(this.fxGroup);
  world.remove(this.indicator);

  // remove all
  // ships
  this.removeAll();

  // remove refs
  this.game = this.socket = this.player = undefined;
};

ShipManager.prototype.disconnect = function() {
  this.removeAll();
};

module.exports = ShipManager;
