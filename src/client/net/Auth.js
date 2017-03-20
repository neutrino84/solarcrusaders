
var engine = require('engine');

function Auth(game) {
  this.game = game;
  this.socket = game.net.socket;

  this.user = null;

  this.socket.on('auth/sync', this._sync.bind(this));
  this.socket.on('auth/data', this._data.bind(this));
};

Auth.prototype.constructor = Auth;

Auth.prototype._sync = function(user) {
  this.user = user;
  this.game.emit('auth/sync', user);
};

Auth.prototype._data = function(user) {
  this.game.emit('auth/data', user);
};

module.exports = Auth;
