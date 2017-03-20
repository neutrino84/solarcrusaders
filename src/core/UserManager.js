
var winston = require('winston'),
    User = require('./objects/User');

function UserManager(game) {
  this.game = game;
  this.model = game.model;

  this.users = {};

  this.game.on('auth/connect', this.connect, this);
  this.game.on('auth/disconnect', this.disconnect, this);
  this.game.on('auth/login', this.login, this);
  this.game.on('auth/data', this.data, this);
};

UserManager.prototype.constructor = UserManager;

UserManager.prototype.init = function() {};

UserManager.prototype.connect = function(socket) {
  var session = socket.request.session,
      user = session.user;
  if(user) {
    if(this.users[user.uuid]) {
      // accessing current user
      winston.info('[UserManager] User already exists in game');
      this.users[user.uuid].socket = socket;
      this.game.emit('auth/login', this.users[user.uuid]);
    } else if(socket) {
      // create a new user
      winston.info('[UserManager] Creating new user in game');
      user = this.users[user.uuid] = new User(this, user, socket);
      user.init(function(err) {
        this.game.emit('auth/login', user);
      }, this);
    }
  } else {
    winston.info('[UserManager] User session data was never created');
    socket.disconnect();
  }
};

UserManager.prototype.disconnect = function(socket) {
  var game = this.game,
      session = socket.request.session,
      user = this.users[session.user.uuid];
      user && user.destroy();
};

UserManager.prototype.login = function(user) {
  user.socket.emit('auth/sync', user.toStreamObject());
};

UserManager.prototype.logout = function(user) {
  user.socket.disconnect();
};

UserManager.prototype.data = function() {
  //..
};

UserManager.prototype.update = function() {
  //..
};

module.exports = UserManager;
