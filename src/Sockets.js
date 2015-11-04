

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

  this.iorouter.on('ping', function(sock, args, next) {
    sock.emit('pong', {
      time: 0
    });
  });

  this.iorouter.on('user', function(sock, args, next) {
    sock.emit(args[0], {
      user: sock.sock.handshake.session.user
    });
  });

  this.iorouter.on(function(sock, args) {
    winston.info('[Server] Uncaught socket message: ' + args[0]);
  });

  this.iorouter.on(function(err, sock, args, next) {
    sock.emit(args[0], {
      error: error.message
    });
    next();
  });

  next();
};

module.exports = Socket;
