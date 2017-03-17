
var engine = require('engine'),
    EventEmitter = require('eventemitter3');

function Auth(game) {
  this.game = game;
  this.user = {};
  this.ready = false;
  this.socket = game.net.socket;

  this.socket.on('connect', this._connect.bind(this));
  this.socket.on('disconnect', this._disconnected.bind(this));

  this.socket.on('user/sync', this._sync.bind(this));
  this.socket.on('user/data', this._data.bind(this));

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

Auth.prototype._sync = function(user) {
  this.ready = true;
  this.user = user;
  this.emit('sync', this.user);
};

Auth.prototype._data = function(user) {
  for(var key in user) {
    this.user[key] = user[key];
  }
  this.emit('data', this.user);
};

Auth.prototype._connect = function() {
  this.emit('connected');
};

Auth.prototype._disconnected = function() {
  this.emit('disconnected');
};

module.exports = Auth;
