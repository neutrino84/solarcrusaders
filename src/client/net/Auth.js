
var engine = require('engine'),
    EventEmitter = require('eventemitter3');

function Auth(game) {
  this.game = game;
  this.user = {};
  this.socket = game.net.socket;

  this.socket.on('user', this._session.bind(this));
  this.socket.on('connect', this._login.bind(this));
  this.socket.on('disconnect', this._disconnected.bind(this));

  this.game.on('gui/loggedin', this._login, this);
  this.game.on('gui/logout', this._logout, this);

  // if we connect really fast
  if(game.net.connected) {
    this._login();
  }

  EventEmitter.call(this);
};

Auth.prototype = Object.create(EventEmitter.prototype);
Auth.prototype.constructor = Auth;

Auth.prototype.isUser = function() {
  return !this.isGuest();
}

Auth.prototype.isGuest = function() {
  return this.user.role === 'guest' ? true : false;
}

Auth.prototype._session = function(response) {
  if(response === undefined) { throw new Error('[Auth] An empty user object was detected'); }
  this.user = response.user;
  this.emit('user', this.user);
};

Auth.prototype._login = function() {
  this.socket.emit('user');
};

Auth.prototype._logout = function() {
  global.location.reload();
};

Auth.prototype._disconnected = function() {
  this.emit('disconnected');
};

module.exports = Auth;
