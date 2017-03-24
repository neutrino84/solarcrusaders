
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

User.DEFAULT_SHIPS = [{
  name: Generator.getName('ubaidian'),
  chassis: 'ubaidian-x03'
}];

User.prototype.init = function(callback, context) {
  var self = this, 
      data = this.data,
      json = data.toStreamObject(),
      err;

  if(data.isNewRecord()) {
    // default
    this.create(User.DEFAULT_SHIPS, json);
    this.socket.emit('auth/sync', json);

    callback.call(context, err, data);
  } else {
    async.series([
      data.reload.bind(data),
      data.ships.bind(data)
    ], function(err, results) {
      var data = results[0],
          ships = results[1];

      self.data = data;
      self.create(ships, json);
      self.socket.emit('auth/sync', json);

      callback.call(context, err, data);
    });
  }
};

User.prototype.create = function(ships) {
  var chassisAvailable = ['a','b','c','d','e','f'],
  randomChassis = 'ubaidian-x01' + chassisAvailable[Math.floor(Math.random() * chassisAvailable.length)];

  // if(ships && ships.length) {
  //   for(var s=0; s<ships.length; s++) {
  //     ship = ships[s]
  //     data = ship.toStreamObject ? json : ship;

  //     // add to ships
  //     this.ships.push(data);
      
  //     // create user ship
  //     this.game.emit('ship/create', data, this);
  //   }
  // } else {
    // create default ship
    User.count++
    this.game.emit('ship/create', {
      name: Generator.getName('ubaidian'),
      chassis: 
      randomChassis
      // 'ricardo-x01' 
      // 'scavengers-x01d'
      
      // 'enforcers-x01'
      // 'ubaidian-x01b'
      //this.data.role === 'user' ? 'ubaidian-x03' : 'ubaidian-x0' + (User.count % 4 + 1)
    }, this);
  
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

User.prototype.reconnected = function(socket) {
  this.socket = socket;
  this.socket.emit('auth/sync', this.data.toStreamObject());
  this.timeout && this.game.clock.events.remove(this.timeout);
};

User.prototype.disconnected = function(socket) {
  this.timeout = this.game.clock.events.add(10000, this.destroy, this);
};

User.prototype.destroy = function() {
  var ship,
      ships = this.ships,
      game = this.game,
      latency = this.latency;

  // remove ships
  for(var i=0; i<ships.length; i++) {
    ship = ships[i];
    game.emit('ship/remove', ship);
  }

  // destroy objects
  latency.destroy();

  this.manager = this.game = 
    this.model = this.socket = undefined;
};

module.exports = User;
