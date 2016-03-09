
var uuid = require('uuid'),
    engine = require('engine'),
    client = require('client'),
    Utils = require('../utils'),
    Generator = require('../utils/Generator');

function UserManager(game) {
  this.game = game;
  this.model = game.model;
  this.winston = game.winston;
  this.sockets = game.sockets;

  this.users = {};

  this.game.on('auth/login', this.add, this);
  this.game.on('auth/logout', this.remove, this);

  this.game.on('ship/add', this.addShip, this);
  this.game.on('ship/remove', this.removeShip, this);
};

UserManager.prototype.constructor = UserManager;

UserManager.prototype.init = function() {
  var self = this;
};

UserManager.prototype.add = function(user) {
  var self = this, ship,
      cached = this.users[user.uuid],
      u = Utils.extend({}, user);
  if(cached) {
    // throw Error('[UserManager] user already added');
    //.. do nothing for now
  } else {
    u.ships = [];
    this.users[user.uuid] = u;
    if(u.role === 'guest') {
      self.game.emit('ship/create', Generator.getName('ubaidian'), 'ubaidian-x04', {
        kills: u.kills || 0,
        disables: u.disables || 0,
        assists: u.assists || 0
      }, u);
    } else {
      self.game.emit('ship/create', Generator.getName('ubaidian'), 'ubaidian-x04', {
        kills: u.kills || 0,
        disables: u.disables || 0,
        assists: u.assists || 0
      }, u);
    }
  }
};

UserManager.prototype.remove = function(user) {
  if(user && !this.users[user.uuid]) { return; }

  var u = this.users[user.uuid],
      ships = u.ships;
  for(var s in ships) {
    user.kills = ships[s].data.kills;
    user.disables = ships[s].data.disables;
    user.assists = ships[s].data.assists;

    this.game.emit('ship/remove', ships[s]);
  }

  ships = undefined;

  delete this.users[user.uuid];
};

UserManager.prototype.addShip = function(ship) {
  if(ship.user) {
    ship.user.ships.push(ship);
  }
};

UserManager.prototype.removeShip = function(ship) {
  var index, user;
  if(ship.user) {
    user = ship.user;
    index = user.ships.indexOf(ship);
    
    if(user.ships[index]) {
      delete user.ships[index];
    }
  }
};

UserManager.prototype.update = function() {

};

module.exports = UserManager;
