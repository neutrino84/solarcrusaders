
var uuid = require('uuid'),
    engine = require('engine')
    client = require('client'),
    Utils = require('../utils');

function ShipManager(game) {
  this.game = game;
  this.model = game.model;
  this.winston = game.winston;
  this.sockets = game.sockets;
  this.iorouter = game.sockets.iorouter;

  this.ships = {};

  this.game.on('ship/add', this.add, this);
  this.game.on('ship/remove', this.remove, this);
  this.game.on('ship/create', this.create, this);

  // activate ai
  this.game.clock.events.loop(6000, this._updateAI, this) && this._updateAI();
};

ShipManager.prototype.constructor = ShipManager;

ShipManager.prototype.init = function() {
  var self = this;

  // io router
  this.sockets.iorouter.on('ship/data', this.data.bind(this));
  this.sockets.iorouter.on('ship/plot', this.plot.bind(this));

  // generate npcs
  this.generateRandomShips();
};

ShipManager.prototype.add = function(ship) {
  if(this.ships[ship.uuid]) { return; }

  var x = global.parseInt(ship.x, 10),
      y = global.parseInt(ship.y, 10);

  ship.game = this.game;
  ship.throttle = global.parseInt(ship.throttle, 10);
  ship.rotation = global.parseInt(ship.rotation, 10);
  ship.config = engine.ShipConfiguration[ship.chasis];
  ship.position = new engine.Point(x, y);
  ship.movement = new client.Movement(ship);

  this.ships[ship.uuid] = ship;
};

ShipManager.prototype.remove = function(ship) {
  if(!this.ships[ship.uuid]) { return; }
  
  var s = this.ships[ship.uuid];

  delete this.ships[ship.uuid];

  s.movement.destroy();
  s.user = undefined;
  s.movement = undefined;
  s.game = undefined;
  s.position = undefined;
  s.config = undefined;

  this.sockets.io.sockets.emit('ship/destroyed', {
    uuid: ship.uuid
  });
};

ShipManager.prototype.create = function(ship, position, chasis) {
  var s = this.model.ship,
      def = s.createDefaultData();
  if(chasis !== undefined) { ship.chasis = chasis; }
  switch(position) {
    default:
    case 'random':
      position = this._generateRandomPositionInView();
    case Object:
      ship.x = position.x;
      ship.y = position.y;
      break;
  }
  this.add(Utils.extend(ship, def, false));
};

ShipManager.prototype.plot = function(sock, args, next) {
  var user = sock.sock.handshake.session.user,
      s = args[1],
      destination = s.destination,
      ship = this.ships[s.uuid],
      point = new engine.Point(destination.x, destination.y);
  if(ship.user && ship.user.uuid === user.uuid) {
    this._plot(ship, destination);
  }
};

ShipManager.prototype.data = function(sock, args, next) {
  var self = this, ship,
      uuids = args[1].uuids,
      ships = [];
  for(var u in uuids) {
    ship = this.ships[uuids[u]];
    if(ship) {
      ships.push({
        id: ship.id,
        uuid: ship.uuid,
        user: ship.user ? ship.user.uuid : null,
        username: ship.user ? ship.user.username : null,
        chasis: ship.chasis,
        sector: ship.sector,
        x: ship.x,
        y: ship.y,
        throttle: ship.throttle,
        rotation: ship.rottion
      });
    }
  }
  sock.emit('ship/data', {
    ships: ships
  });
};

ShipManager.prototype.update = function() {
  var ship, previous, movement,
      ships = this.ships,
      arr = [];

  for(var s in ships) {
    ship = ships[s];
    movement = ship.movement;

    movement.update();
    movement.startPosition = ship.position.clone();
    previous = movement.previous;

    arr.push({
      uuid: ship.uuid,
      throttle: ship.throttle,
      rotation: ship.rotation,
      previous: previous,
      current: movement.startPosition,
      destination: movement.destination,
      moving: movement.animation.isPlaying
    });
  }

  this.sockets.io.sockets.emit('ship/sync', { ships: arr });
};

ShipManager.prototype.generateRandomShips = function() {
  var data, position, config,
      iterator = {
        'vessel-x01': { count: 1 },
        'vessel-x02': { count: 1 },
        'vessel-x03': { count: 1 },
        'vessel-x04': { count: 25 },
        'vessel-x05': { count: 5 }
      };
  for(var key in iterator) {
    for(var i=0; i<iterator[key].count; i++) {
      config = engine.ShipConfiguration[key];
      position = this._generateRandomPositionInView();
      data = {
        uuid: uuid.v4(),
        x: position.x,
        y: position.y,
        rotation: global.Math.random() * global.Math.PI,
        chasis: key,
        throttle: 0.8 + (global.Math.random() * 3)
      };
      this.add(data);
    }
  }
};

ShipManager.prototype._plot = function(ship, destination) {
  ship.movement.update();
  ship.movement.startPosition = ship.position.clone();
  previous = ship.movement.previous;

  ship.movement.plot(destination, ship.movement.startPosition, previous);

  this.sockets.io.sockets.emit('ship/plotted', {
    uuid: ship.uuid,
    destination: destination,
    throttle: ship.throttle,
    rotation: ship.rotation,
    current: ship.movement.startPosition,
    previous: previous
  });
};

ShipManager.prototype._updateAI = function() {
  var ship, destination, previous,
      ships = this.ships,
      arr = [];
  for(var s in ships) {
    ship = ships[s];
    if(!ship.user && global.Math.random() > 0.5) {
      destination = this._generateRandomPosition();
      this._plot(ship, destination);
    }
  }
};

ShipManager.prototype._generateRandomPositionInView = function() {
  // for debug purposes only
  var randX = global.Math.random() * 1024 - 512,
      randY = global.Math.random() * 1024 - 512;
  return new engine.Point(2048 + randX, 2048 + randY);
};

ShipManager.prototype._generateRandomPosition = function() {
  var randX = global.Math.random() * 2048 - 1024,
      randY = global.Math.random() * 2048 - 1024;
  return new engine.Point(2048 + randX, 2048 + randY);
};

module.exports = ShipManager;
