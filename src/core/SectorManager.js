
var uuid = require('uuid'),
    engine = require('engine')
    client = require('client');

function SectorManager(game) {
  this.game = game;
  this.model = game.model;
  this.winston = game.winston;
  this.io = game.sockets.io;
  this.iorouter = game.sockets.iorouter;

  this.users = {};
  this.ships = {};

  // this.iorouter.on('plot', this.plot.bind(this));

  // activate ai
  this.game.clock.events.loop(10000, this._updateAI, this);
};

SectorManager.prototype.constructor = SectorManager;

SectorManager.prototype.init = function() {
  var self = this;
  this.io.on('connection', function(socket) {
    var session = socket.handshake.session,
        user = session.user;
    self.add(user);
    socket.on('disconnect', function() {
      self.remove(user);
    });
  });

  // generate npcs
  this.generateRandomShips();
};

// SectorManager.prototype.plot = function(sock, args, next) {
//   var course = args[1],
//       destination = course.destination,
//       uuid = course.uuid,
//       ship = this.ships[uuid],
//       point = new engine.Point(destination.x, destination.y);
//   ship.movement.plot(point);
//   this.io.sockets.emit('plotted', {
//     uuid: ship.uuid,
//     destination: destination,
//     throttle: ship.throttle,
//     rotation: ship.rotation,
//     position: ship.position
//   });
// };

SectorManager.prototype.add = function(object) {
  var self = this;
  switch(object.type) {
    case 'ship':
      this.ships[object.uuid] = object;
      break;
    case 'user':
      this.users[object.uuid] = object;
      this.model.ship.getShipsByUid(object.uid, function(err, ships) {
        if(err) { throw new Error(err); }
        var ship;
        for(var s in ships) {
          ship = self.ships[ships[s].uuid] = ships[s];
          ship.user = object;
          ship.game = self.game;
          ship.throttle = global.parseInt(ship.throttle, 10);
          ship.position = new engine.Point(global.parseInt(ship.x, 10), global.parseInt(ship.y, 10));
          ship.rotation = global.parseInt(ship.rotation, 10);
          ship.config = engine.ShipConfiguration[ship.chasis];
          ship.movement = new client.Movement(ship);
        }
      });
      break;
  }
};

SectorManager.prototype.remove = function(object) {
  switch(object.type) {
    case 'ship':
      delete this.ships[object.uuid];
      break;
    case 'user':
      delete this.users[object.uuid];
      break;
  }
};

SectorManager.prototype.update = function() {
  var ship, previous, movement,
      users = this.users,
      ships = this.ships,
      arr = [];
  for(var s in ships) {
    ship = ships[s];
    movement = ship.movement;

    if(!ship.user || users[ship.user.uuid]) {

      movement.update();
      movement.startPosition = ship.position.clone();
      previous = movement.previous;

      arr.push({
        uuid: ship.uuid,
        chasis: ship.chasis,
        throttle: ship.throttle,
        rotation: ship.rotation,
        previous: previous,
        current: movement.startPosition,
        destination: movement.destination,
        moving: movement.animation.isPlaying
      });
    } else {
      // cleanup
      delete this.ships[ship.uuid];
    }
  }

  //.. TODO: create delay
  this.io.sockets.emit('sync', {
    ships: arr
  });
};

SectorManager.prototype.generateRandomShips = function() {
  var ship, position, guid,
      iterator = {
        'vessel-x01': { count: 2 },
        'vessel-x02': { count: 2 },
        'vessel-x03': { count: 2 },
        'vessel-x04': { count: 20 },
        'vessel-x05': { count: 5 }
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

SectorManager.prototype._updateAI = function() {
  var ship, destination, previous,
      ships = this.ships,
      arr = [];
  for(var s in ships) {
    ship = ships[s];
    if(global.Math.random() > 0.5) {
      
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

SectorManager.prototype._generateRandomPositionInView = function() {
  // for debug purposes only
  var randX = global.Math.random() * 2048 - 1028,
      randY = global.Math.random() * 2048 - 1028;
  return new engine.Point(2048 + randX, 2048 + randY);
};

module.exports = SectorManager;
