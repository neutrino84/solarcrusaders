

function Socket(app) {
  this.app = app;
  this.server = app.server;

  this.io = require('socket.io')(this.server.http);
  this.iosess = require('socket.io-express-session'),
  this.iorouter = require('socket.io-events')();
};

Socket.prototype.constructor = Socket;

Socket.prototype.init = function(next) {
  this.io.use(this.iosess(this.server.session));
  this.io.use(this.iorouter);

  // add socket id to user
  this.io.on('connection', function(socket) {
    var session = socket.handshake.session,
        user = session.user;
    user.socket = socket.id;
  });

  next();
};

module.exports = Socket;
