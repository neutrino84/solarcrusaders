
var engine = require('engine'),
    EventEmitter = require('eventemitter3');

function Auth(game) {
  this.game = game;
  this.user = {};
  this.ready = false;
  this.socket = game.net.socket;

  this.socket.on('user', this._user.bind(this));
  this.socket.on('connect', this._connect.bind(this));
  this.socket.on('disconnect', this._disconnected.bind(this));

  this.game.on('gui/login', this._login, this);
  this.game.on('gui/logout', this._logout, this);

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

Auth.prototype._user = function(user) {
  this.ready = true;
  this.user = user;
  this.emit('user', this.user);
};

Auth.prototype._login = function(user) {
  //..
};

Auth.prototype._logout = function() {
  //..
};

Auth.prototype._connect = function() {
  this.emit('connected');
};

Auth.prototype._disconnected = function() {
  this.emit('disconnected');
};

module.exports = Auth;
