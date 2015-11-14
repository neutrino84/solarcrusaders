
var engine = require('engine'),
    EventEmitter = require('eventemitter3');

function Auth(game) {
  this.game = game;
  this.user = {};
  this.socket = game.net.socket;

  this.socket.on('user', this.session.bind(this));
  this.socket.on('connect', this.login.bind(this));
  this.socket.on('disconnect', this._disconnected.bind(this));

  this.game.on('gui/logout', this.logout, this);

  // if we connect really fast
  if(game.net.connected) {
    this.login();
  }

  EventEmitter.call(this);
};

Auth.prototype = Object.create(EventEmitter.prototype);
Auth.prototype.constructor = Auth;

Auth.prototype.isUser = function() {
  return this.user.uid ? true : false;
}

Auth.prototype.isGuest = function() {
  return this.user.uid === 0 ? true : false;
}

Auth.prototype.invalidate = function() {
  this.user = {};
  this.emit('invalidated');
};

Auth.prototype.session = function(response) {
  if(response === undefined) { throw new Error('[Auth] An empty user object was detected'); }
  this.user = response.user;
  this.emit('user', this.user);
};

Auth.prototype.login = function() {
  this.socket.emit('user');
};

Auth.prototype.logout = function() {
  global.location.reload();
};

Auth.prototype._disconnected = function() {
  this.invalidate();
};

module.exports = Auth;
