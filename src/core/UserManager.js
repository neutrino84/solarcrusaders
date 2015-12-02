
var uuid = require('uuid'),
    engine = require('engine')
    client = require('client');

function UserManager(game) {
  this.game = game;
  this.model = game.model;
  this.winston = game.winston;
  this.sockets = game.sockets;

  this.users = {};

  this.game.on('auth/login', this.add, this);
  this.game.on('auth/logout', this.remove, this);

  this.game.on('user/ship/add', this.addShip, this);
  this.game.on('user/ship/remove', this.removeShip, this);
};

UserManager.prototype.constructor = UserManager;

UserManager.prototype.init = function() {
  var self = this;
};

UserManager.prototype.add = function(user) {
  if(this.users[user.uuid]) { return; }

  var self = this, ship,
      u = this.users[user.uuid] = user;
      u.ships = [];

  if(user.uid > 0) {
    this.model.ship.getShipsByUid(user.uid, function(err, ships) {
      if(err) { throw new Error(err); }
      for(var s in ships) {
        ship = ships[s];
        ship.user = user;
        u.ships.push(ship);
        self.game.emit('ship/add', ship);
      }
    });
  } else {
    ship = {};
    ship.user = user;
    ship.throttle = 3.0;
    ship.chasis = 'vessel-x0' + (global.Math.floor(global.Math.random() * 5) + 1);
    u.ships.push(ship);
    self.game.emit('ship/create', ship);
  }
};

UserManager.prototype.remove = function(user) {
  if(!this.users[user.uuid]) { return; }

  var u = this.users[user.uuid],
      ships = u.ships;
  for(var s in ships) {
    this.game.emit('ship/remove', ships[s]);
    ships[s] = undefined;
  }

  ships = undefined;

  delete this.users[user.uuid];
};

UserManager.prototype.addShip = function() {

};

UserManager.prototype.removeShip = function() {

};

UserManager.prototype.update = function() {

};

module.exports = UserManager;
