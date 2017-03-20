
var async = require('async'),
    Generator = require('../../utils/Generator'),
    Latency = require('../../utils/Latency'),
    EventEmitter = require('eventemitter3');

function User(manager, data, socket) {
  this.manager = manager;
  this.game = manager.game;
  this.model = manager.model;
  this.socket = socket;

  this.ships = [];
  this.data = new this.model.User(data);
  this.uuid = this.data.uuid;

  this.latency = new Latency(this);
};

User.prototype.constructor = User;

User.DEFAULT_SHIP = [{
  name: Generator.getName('ubaidian'),
  chassis: 'ubaidian-x03'
}];

User.prototype.init = function(callback, context) {
  var self = this, 
      data = this.data,
      err;

  if(data.isNewRecord()) {
    // default
    this.create(User.DEFAULT_SHIP);
    this.socket.emit('auth/sync', data.toStreamObject());

    callback.call(context, err, data);
  } else {
    async.series([
      data.reload.bind(data),
      data.ships.bind(data)
    ], function(err, results) {
      var data = results[0],
          ships = results[1];

      self.data = data;
      self.create(ships);
      self.socket.emit('auth/sync', data.toStreamObject());

      callback.call(context, err, data);
    });
  }
};

User.prototype.create = function(ships) {
  var game = this.game,
      ship, data;
  if(ships && ships.length) {
    for(var s=0; s<ships.length; s++) {
      ship = ships[s]
      data = ship.toStreamObject ? ship.toStreamObject() : ship;
      
      // create user ship
      game.emit('ship/create', data, this);
    }
  }
};

User.prototype.save = function(callback) {
  var self = this, ship,
      ships = this.ships,
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

User.prototype.toStreamObject = function() {
  return this.data.toStreamObject();
};

User.prototype.destroy = function() {
  var ship,
      ships = this.ships,
      game = this.game;
  
  // remove player ships
  for(var i=0; i<ships.length; i++) {
    ship = ship[i];
    game.emit('ship/remove', ship, this);
  }

  // destroy objects
  this.latency.destroy();
  this.socket.request.session.destroy();
  this.socket.disconnect(true);
  this.game.emit('auth/removed', this);
};

module.exports = User;
