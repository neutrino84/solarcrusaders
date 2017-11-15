
var uuid = require('uuid'),
    engine = require('engine')
    client = require('client'),
    ShipManager = require('./ShipManager'),
    UserManager = require('./UserManager'),
    StationManager = require('./StationManager'),
    EventManager = require('./EventManager');

function SectorManager(game) {
  this.game = game;
  this.sockets = game.sockets;

  // buffer
  this.updates = {
    ships: [],
    stations: [],
    users: []
  };

  // instance managers
  this.eventManager = new EventManager(game);
  this.userManager = new UserManager(game);
  this.stationManager = new StationManager(game);
  this.shipManager = new ShipManager(game);
};

SectorManager.prototype.constructor = SectorManager;

SectorManager.prototype.init = function() {
  this.eventManager.init();
  this.userManager.init();
  this.stationManager.init();
  this.shipManager.init();

  // user request data
  this.sockets.on('sector/data', this.data, this);

  // listen for data
  this.game.on('ship/data', this.queue('ships'), this);
  this.game.on('station/data', this.queue('stations'), this);
  this.game.on('user/data', this.queue('users'), this);

  // start game
  this.eventManager.start();

  // queue
  this.game.clock.events.loop(50, this.queued, this);
};

SectorManager.prototype.update = function() {
  var sockets = this.sockets,
      ships = this.shipManager.sync(),
      stations = this.stationManager.sync();

  // update events
  this.eventManager.update();

  // syncronize all
  sockets.send('sector/sync', {
    ships: ships,
    stations: stations
  });
};

SectorManager.prototype.data = function(socket, args) {
  var uuids = args[1],
      users = this.userManager.data(uuids.users),
      ships = this.shipManager.data(uuids.ships),
      stations = this.stationManager.data(uuids.stations);

  // relay data to user
  socket.emit('sector/data', {
    type: 'sync',
    ships: ships,
    stations: stations,
    users: users
  });
};

SectorManager.prototype.queue = function(key) {
  return function(updates) {
    this.updates[key] = this.updates[key].concat(updates);
  }
};

SectorManager.prototype.queued = function() {
  var updates = this.updates;
  if(updates.ships.length > 0 ||
      updates.stations.length > 0 ||
      updates.users.length > 0) {

    // send data
    this.sockets.send('sector/data', {
      type: 'update',
      ships: updates.ships,
      stations: updates.stations,
      users: updates.users
    });

    // clear buffer
    this.updates = {
      ships: [],
      stations: [],
      users: []
    };
  }
};

module.exports = SectorManager;
