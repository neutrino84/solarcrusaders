
var winston = require('winston'),
    User = require('./objects/User');

function UserManager(game) {
  this.game = game;
  this.model = game.model;
  this.sockets = game.sockets.ioserver;

  this.users = {};

  this.game.on('auth/connect', this.connect, this);
  this.game.on('auth/disconnect', this.disconnect, this);
  this.game.on('auth/data', this.data, this);
  this.game.on('auth/remove', this.remove, this); 
};

UserManager.prototype.constructor = UserManager;

UserManager.prototype.init = function() {

};

UserManager.prototype.add = function(user) {
  this.users[user.uuid] = user;
};

UserManager.prototype.remove = function(user) {
  delete this.users[user.uuid];
};

UserManager.prototype.connect = function(socket) {
  var session = socket.request.session,
      user = session ? session.user : false;
  if(user) {
    if(this.exists(user)) {
      winston.info('[UserManager] User already exists in game');
    } else if(user && socket && session) {
      winston.info('[UserManager] Creating user in game');
      user = new User(this, user, socket);
      user.init(function(err, data) {
        this.add(user);
      }, this);
    } else {
      winston.info('[UserManager] User session data error');
      socket.disconnect(true);
    }
  } else {
    winston.info('[UserManager] User session data error');
    socket.disconnect(true);
  }
};

UserManager.prototype.disconnect = function(socket) {
  var session = socket.request.session,
      user = session.user;
      session && user && user.destroy();
};

UserManager.prototype.data = function() {
  //..
};

UserManager.prototype.update = function() {
  //..
};

UserManager.prototype.exists = function(user) {
  return user && this.users[user.uuid] ? true : false;
};

module.exports = UserManager;
