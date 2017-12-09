
var async = require('async'),
    Generator = require('../../utils/Generator'),
    Latency = require('../../utils/Latency'),
    EventEmitter = require('eventemitter3');

function User(game, data, socket) {
  this.game = game;
  this.model = game.model;
  this.socket = socket;

  this.latency = new Latency(this);
  this.data = new this.model.User(data);

  this.ship = null;
  this.station = null;
  this.uuid = this.data.uuid;
};

User.prototype.constructor = User;

User.prototype.init = function(callback, context) {
  var self = this,
      game = this.game,
      data = this.data,
      socket = this.socket,
      latency = this.latency;

  if(data.isNewRecord()) {
    // connect demo ship
     
    // game.emit('ship/create', {
    //   chassis: 'ubaidian-x01'
    // }, this);

    // update client
    socket.emit('auth/sync', this.data.toStreamObject());

    // update latency
    latency.connect(socket);

    // call callback
    callback.call(context);
  } else {
    async.series([
      data.reload.bind(data),
      data.ships.bind(data)
    ], function(err, results) {
      var data = results[0],
          ships = results[1];

      if(ships && ships.length) {
        for(var s=0; s<ships.length; s++) {
          if(ship.uuid === this.data.ship) {
            ship = ships[s].toStreamObject();

            // create user ship
            game.emit('ship/create', ship, this);
          }
        }
      }

      // call callback
      callback.call(context);
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
  // update socket
  this.socket = socket;
  this.socket.emit('auth/sync', this.data.toStreamObject());

  // update latency
  this.latency.connect(socket);

  // restart user logout timer
  this.timeout && this.game.clock.events.remove(this.timeout);
};

User.prototype.disconnected = function() {
  this.timeout = this.game.clock.events.add(10000, this.destroy, this);
};

User.prototype.destroy = function() {
  // remove ships
  this.game.emit('ship/remove', this.ship);

  // remove from manager
  this.game.emit('auth/remove', this);

  // destroy objects
  this.latency.destroy();

  // cleanup
  this.game = this.model = this.latency = this.ship =
    this.station = this.data = this.socket = undefined;
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
