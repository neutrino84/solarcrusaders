
var engine = require('engine'),
    EventEmitter = require('eventemitter3');

function Auth(game) {
  this.game = game;
  this.user = {};
  this.socket = game.net.socket;

  this.socket.on('user', this.session.bind(this));
  this.socket.on('connect', this.getUser.bind(this));
  this.socket.on('disconnect', this.disconnect.bind(this));

  if(game.net.connected) {
    this.getUser();
  }
};

Auth.prototype.constructor = Auth;

Auth.prototype.invalidate = function() {
  this.user = {};
};

Auth.prototype.session = function(response) {
  this.user = response.user || {};
};

Auth.prototype.isUser = function() {
  return this.user.uid ? true : false;
}

Auth.prototype.getUser = function() {
  this.socket.emit('user');
};

Auth.prototype.disconnect = function() {};

module.exports = Auth;
