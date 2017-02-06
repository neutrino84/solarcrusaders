
var async = require('async'),
    Generator = require('../../utils/Generator'),
    EventEmitter = require('eventemitter3');

function User(manager, data) {
  this.manager = manager;
  this.game = manager.game;
  this.model = manager.model;

  this.ships = [];
  
  this.data = new this.model.User(data);

  this.uuid = this.data.uuid;
};

// temp remove this
User.count = 0;

User.prototype.constructor = User;

User.prototype.init = function(callback) {
  var self = this;
  if(this.data.isNewRecord()) {
    this.create();
    callback();
  } else {
    async.series([
      this.data.reload.bind(this.data),
      this.data.ships.bind(this.data)
    ], function(err, results) {
      var data = results[0],
          ships = results[1];
      self.data = data;
      self.create(ships);
      callback(err);
    });
  }
};

User.prototype.create = function(ships) {
  if(ships && ships.length) {
    for(var s=0; s<ships.length; s++) {
      this.game.emit('ship/create', ships[s].toStreamObject(), this);
    }
  } else {
    // create default ship
    User.count++
    this.game.emit('ship/create', {
      name: Generator.getName('ubaidian'),
      chassis: 'ubaidian-x04' //this.data.role === 'user' ? 'ubaidian-x03' : 'ubaidian-x0' + (User.count % 4 + 1)
    }, this);
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

module.exports = User;
