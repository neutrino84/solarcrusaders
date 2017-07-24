
var EventEmitter = require('eventemitter3'),
    io = require('socket.io'),
    winston = require('winston');

function Socket(app) {
  this.app = app;
  this.server = app.server;

  EventEmitter.call(this);
};

Socket.prototype = Object.create(EventEmitter.prototype);
Socket.prototype.constructor = Socket;

Socket.prototype.init = function(next) {
  var server = this.server,
      options = {
        transports: ['websocket']
      };

  // initialize socket server
  this.ioserver = io(server.http, options);
  this.ioserver.use(this.configure.bind(this));
  this.ioserver.on('connection', function(socket) {
    // listent to socket events
    socket.on('disconnect', this.disconnect.bind(this, socket));
    socket.on('disconnecting', this.disconnecting.bind(this, socket));

    // emit global socket messages
    socket.use(this.receive.bind(this, socket));
  }.bind(this));

  next();
};

Socket.prototype.configure = function(socket, next) {
  var request = socket.request,
      res = { end: function() {}, write: function() {} };
  this.server.session(request, res, next);
};

Socket.prototype.send = function(path, data) {
  this.ioserver.emit(path, data);
};

Socket.prototype.receive = function(socket, args, err) {
  this.emit(args[0], socket, args, err);
};

Socket.prototype.disconnecting = function(socket) {
  this.app.game.emit('auth/disconnecting', socket);
};

Socket.prototype.disconnect = function(socket) {
  this.app.game.emit('auth/disconnect', socket);
};

module.exports = Socket;
