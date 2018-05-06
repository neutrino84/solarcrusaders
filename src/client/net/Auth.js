
var engine = require('engine');

function Auth(game) {
  this.game = game;
  this.net = game.net;

  // current user
  this.user = null;

  // request connection
  this.socket = this.net.connect();

  // connect services
  this.socket.on('connect', this._connect.bind(this));
  this.socket.on('disconnect', this._disconnect.bind(this));
  this.socket.on('auth/sync', this._sync.bind(this));
};

Auth.prototype.constructor = Auth;

Auth.prototype._connect = function() {
  this.socket.emit('auth/connect');
};

Auth.prototype._disconnect = function() {
  this.game.emit('auth/disconnect');
};

Auth.prototype._sync = function(user) {
  this.user = user;


  this.game.emit('auth/sync', user);

  if(user.tutorial){
    this.game.emit('user/shipSelected/tutorial')
  }
};

module.exports = Auth;
