
var uuid = require('uuid'),
    engine = require('engine'),
    client = require('client'),
    Utils = require('../utils');

function UserManager(game) {
  this.game = game;
  this.model = game.model;
  this.winston = game.winston;
  this.sockets = game.sockets;

  this.users = {};

  this.game.on('auth/login', this.add, this);
  this.game.on('auth/logout', this.remove, this);
};

UserManager.prototype.constructor = UserManager;

UserManager.prototype.init = function() {
  var self = this;
};

UserManager.prototype.add = function(user) {
  var self = this, ship,
      u = this.users[user.uuid] = Utils.extend({}, user);
      u.ships = [];

  if(u.id > 0) {
    // logged in, get ships, or create a new one
  } else {
    self.game.emit('ship/create', 'abcd', 'ubaidian-x01', u);
  }
};

UserManager.prototype.remove = function(user) {
  if(user && !this.users[user.uuid]) { return; }

  var u = this.users[user.uuid],
      ships = u.ships;
  for(var s in ships) {
    this.game.emit('ship/remove', ships[s]);
    ships[s] = undefined;
  }

  ships = undefined;

  delete this.users[user.uuid];
};

UserManager.prototype.update = function() {

};

module.exports = UserManager;
