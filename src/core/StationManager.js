
var uuid = require('uuid'),
    engine = require('engine');

function StationManager(game) {
  this.game = game;
  this.model = game.model;
  this.sockets = game.sockets;
  this.iorouter = game.sockets.iorouter;

  this.stations = {};
};

StationManager.prototype.constructor = StationManager;

StationManager.prototype.init = function() {
  
};

StationManager.prototype.data = function(sock, args, next) {
  sock.emit('station/data', {
    type: 'sync', ships: ships
  });
};

StationManager.prototype.update = function() {

};

module.exports = StationManager;
