
var async = require('async'),
    Generator = require('../../utils/Generator'),
    Latency = require('../../utils/Latency'),
    EventEmitter = require('eventemitter3');

function User(manager, data, socket) {
  this.manager = manager;
  this.game = manager.game;
  this.model = manager.model;
  this.socket = socket;

  this.latency = new Latency(this);
  this.data = new this.model.User(data);
  
  this.uuid = this.data.uuid;
  this.socket.on('ship/select', this.select.bind(this));
};

User.prototype.constructor = User;

User.DEFAULT_SHIPS = [{
  name: Generator.getName('ubaidian')
}];

User.prototype.init = function(callback, context) {
  var self = this, err,
      data = this.data,
      json = data.toStreamObject();

  if(data.isNewRecord()) {
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
  var data,
      game = this.game,
      rnd = game.rnd,
      variations = ['a','b','c','d','e','f'];

  if(ships && ships.length) {
    for(var s=0; s<ships.length; s++) {
      ship = ships[s];
      data = ship.toStreamObject ? json : ship;

      // set chassis
      if(!data.chassis) {
        data.chassis = 'ubaidian-x01' + rnd.pick(variations);
      }
      // create user ship
      this.game.emit('ship/create', data, this);
    }
  }
};

User.prototype.select = function(){
  this.create(User.DEFAULT_SHIPS, json);
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

    game.emit('ship/remove', ship);


  // destroy objects
  latency.destroy();

  this.manager = this.game = 
    this.model = this.socket = undefined;
};

module.exports = User;
