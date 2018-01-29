
var async = require('async'),
    Generator = require('../../utils/Generator'),
    Latency = require('../../utils/Latency'),
    EventEmitter = require('eventemitter3');

function User(game, data, socket) {
  this.game = game;
  this.model = game.model;

  // data model
  this.data = new this.model.User(data);
  this.data.init();

  // data shortcuts
  this.uuid = this.data.uuid;
  this.username = this.data.username;

  // relationships
  this.socket = null;
  this.ship = null;

  // variables
  this.offline = true;

  // rtt ping engine
  this.latency = new Latency(this);
};

User.prototype.constructor = User;

User.prototype.init = function(callback, context) {
  var self = this,
      game = this.game,
      data = this.data,
      socket = this.socket,
      latency = this.latency;

  if(data.isNewRecord()) {
    callback.call(context, self);
  } else {
    async.series([
      data.reload.bind(data),
      data.ships.bind(data)
    ], function(err, results) {
      var data = results[0],
          ship, ships = results[1];

      // create
      if(ships && ships.length) {
        for(var s=0; s<ships.length; s++) {
          // create user ship
          game.emit('ship/create', ships[s].toStreamObject());
        }
      }

      // call callback
      callback.call(context, self);
    });
  }
};

User.prototype.save = function(callback) {
  var self = this, ship,
      len = ships.length,
      series = [];

  // save user
  series.push(function(next) {
    self.data.updateAttributes({
      credits: self.data.credits,
      reputation: self.data.reputation
    }, next);
  });

  // save ships
  for(var s=0; s<len; s++) {
    ship = ships[s];
    series.push(ship.save.bind(ship));
  }

  // persist
  async.series(series, callback);
};

User.prototype.reconnected = function(socket) {
  // set variables
  this.offline = false;

  // update socket
  this.socket = socket;
  this.socket.emit('auth/sync', this.data.toStreamObject());

  // update latency
  this.latency.connect(socket);

  // stop user logout timer
  this.timeout && this.game.clock.events.remove(this.timeout);
};

User.prototype.disconnected = function() {
  // set variables
  this.offline = true;

  // start user logout timer
  this.timeout = this.game.clock.events.add(5000, this.destroy, this);
};

User.prototype.destroy = function() {
  // remove ship
  this.ship && this.game.emit('ship/remove', this.ship);

  // remove from world
  delete this.game.users[this.uuid];

  // cleanup
  this.game = this.model = 
    this.latency = this.ship = this.data =
    this.socket = undefined;
};


Object.defineProperty(User.prototype, 'credits', {
  get: function() {
    return this.data.credits;
  },

  set: function(value) {
    this.data.credits = value;
  }
});

module.exports = User;
