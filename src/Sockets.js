
function Socket(app) {
  this.app = app;
  this.server = app.server;

  this.io = require('socket.io')(this.server.http, { transports: ['websocket'], allowUpgrades: false });
  this.iosess = require('socket.io-express-session'),
  this.iorouter = require('socket.io-events')();
};

Socket.prototype.constructor = Socket;

Socket.prototype.init = function(next) {
  this.io.use(this.iosess(this.server.session));
  this.io.use(this.iorouter);

  // add socket id to user
  this.io.on('connection', function(socket) {
    var handshake = socket.handshake
        session = handshake.session
    session.socket = socket.id;
    session.save();
  });

  next();
};

Socket.prototype.getSocketById = function(id) {
  return this.io.sockets.connected[id];
};

module.exports = Socket;
