
var uuid = require('uuid'),
    engine = require('engine')
    client = require('client');

function ShipManager(game) {
  this.game = game;
  this.model = game.model;
  this.winston = game.winston;
  this.io = game.sockets.io;
  this.iorouter = game.sockets.iorouter;

  this.ships = {};

  // activate ai
  this.game.clock.events.loop(10000, this._updateAI, this);
};

ShipManager.prototype.constructor = ShipManager;

ShipManager.prototype.init = function() {
  var self = this;

  // navigation
  // this.iorouter.on('plot', this.plot.bind(this));

  // generate npcs
  this.generateRandomShips();
};

ShipManager.prototype.plot = function(sock, args, next) {
  var session = sock.sock.handshake.session,
      user = session.user,
      course = args[1],
      destination = course.destination,
      uuid = course.uuid,
      ship = this.ships[uuid],
      point = new engine.Point(destination.x, destination.y);
  
  if(ship.user && ship.user.uuid === user.uuid) {
    ship.movement.update();
    ship.movement.startPosition = ship.position.clone();
    
    previous = ship.movement.previous;

    ship.movement.plot(destination, ship.movement.startPosition, previous);

    this.io.sockets.emit('plotted', {
      uuid: ship.uuid,
      destination: destination,
      throttle: ship.throttle,
      rotation: ship.rotation,
      current: ship.movement.startPosition,
      previous: previous
    });
  }
};

ShipManager.prototype.update = function() {
  var ship, previous, movement,
      users = this.users,
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
      user: ship.user ? ship.user.uuid : null,
      chasis: ship.chasis,
      throttle: ship.throttle,
      rotation: ship.rotation,
      previous: previous,
      current: movement.startPosition,
      destination: movement.destination,
      moving: movement.animation.isPlaying
    });
  }

  //.. TODO: create delay
  // this.io.sockets.emit('sync', {
  //   ships: arr
  // });
};

ShipManager.prototype.generateRandomShips = function() {
  var ship, position, guid,
      iterator = {
        'vessel-x01': { count: 0 },
        'vessel-x02': { count: 0 },
        'vessel-x03': { count: 0 },
        'vessel-x04': { count: 0 },
        'vessel-x05': { count: 0 }
      };
  for(var key in iterator) {
    for(var i=0; i<iterator[key].count; i++) {
      guid = uuid.v4();

      this.ships[guid] = ship = {
        chasis: key
      };

      ship.uuid = guid;
      ship.user = null;
      ship.game = this.game;
      ship.position = this._generateRandomPositionInView();
      ship.rotation = global.Math.random() * global.Math.PI;
      ship.config = engine.ShipConfiguration[key];
      ship.throttle = ship.config.speed * (global.Math.random() * 4 + 1);
      ship.movement = new client.Movement(ship);
    }
  }
};

ShipManager.prototype._updateAI = function() {
  var ship, destination, previous,
      ships = this.ships,
      arr = [];
  for(var s in ships) {
    ship = ships[s];

    if(!ship.user && global.Math.random() > 0.5) {
      
      destination = this._generateRandomPositionInView();

      ship.movement.update();
      ship.movement.startPosition = ship.position.clone();
      previous = ship.movement.previous;

      ship.movement.plot(destination, ship.movement.startPosition, previous);

      this.io.sockets.emit('plotted', {
        uuid: ship.uuid,
        destination: destination,
        throttle: ship.throttle,
        rotation: ship.rotation,
        current: ship.movement.startPosition,
        previous: previous
      });
    }
  }
};

ShipManager.prototype._generateRandomPositionInView = function() {
  // for debug purposes only
  var randX = global.Math.random() * 2048 - 1028,
      randY = global.Math.random() * 2048 - 1028;
  return new engine.Point(2048 + randX, 2048 + randY);
};

module.exports = ShipManager;
