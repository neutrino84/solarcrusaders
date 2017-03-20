
var engine = require('engine');

function Auth(game) {
  this.game = game;
  this.net = game.net;

  this.user = null;

  // request connection
  this.socket = this.net.connect();

  // connect services
  this.socket.on('connect', this._connect.bind(this));
  this.socket.on('auth/sync', this._sync.bind(this));
  this.socket.on('auth/data', this._data.bind(this));
};

Auth.prototype.constructor = Auth;

Auth.prototype._connect = function() {
  this.socket.emit('auth/connect');
};

Auth.prototype._sync = function(user) {
  this.user = user;
  this.game.emit('auth/sync', user);
};

Auth.prototype._data = function(user) {
  this.game.emit('auth/data', user);
};

module.exports = Auth;
