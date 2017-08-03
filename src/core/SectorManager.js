
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
  this.stationManager = new StationManager(game);
  this.shipManager = new ShipManager(game);
  this.userManager = new UserManager(game);
  this.eventManager = new EventManager(game);
};

SectorManager.prototype.constructor = SectorManager;

SectorManager.prototype.init = function() {
  this.stationManager.init();
  this.shipManager.init();
  this.userManager.init();
  this.eventManager.init();

  // user request data
  this.sockets.on('sector/data', this.data, this);

  // listen for data
  this.game.on('ship/data', this.queue('ships'), this);
  this.game.on('station/data', this.queue('stations'), this);
  this.game.on('user/data', this.queue('users'), this);

  // queue
  this.game.clock.events.loop(50, this.queued, this);
};

SectorManager.prototype.update = function() {
  var sockets = this.sockets,
      users = this.userManager.all(),
      ships = this.shipManager.sync(),
      stations = this.stationManager.sync();

  // syncronize all
  sockets.send('sector/sync', {
    users: users,
    ships: ships,
    stations: stations
  });
};

SectorManager.prototype.data = function(socket, args) {
  var uuids = args[1],
      ships = this.shipManager.data(uuids.ships),
      stations = this.stationManager.data(uuids.stations),
      users = this.userManager.data(uuids.users);

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
