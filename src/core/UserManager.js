
var winston = require('winston'),
    User = require('./objects/User');

function UserManager(game) {
  this.game = game;
  this.model = game.model;
  
  this.sockets = {};
  this.sessions = {};
  this.users = {};

  this.game.on('auth/connection', this.connection, this);
  this.game.on('auth/disconnect', this.disconnect, this);

  this.game.on('auth/login', this.login, this);
  this.game.on('auth/logout', this.logout, this);

  this.game.on('ship/add', this.addShip, this);
  this.game.on('ship/remove', this.removeShip, this);
};

UserManager.prototype.constructor = UserManager;

UserManager.prototype.init = function() {};

UserManager.prototype.connection = function(socket) {
  var session = socket.handshake.session,
      user = session.user;
  if(user) {
    this.sockets[socket.id] = socket;
    this.game.emit('auth/login', session);
  } else {
    socket.disconnect();
  }
};

UserManager.prototype.disconnect = function(socket) {
  var game = this.game,
      session = socket.handshake.session;
  game.emit('auth/logout', session);
  delete this.sockets[socket.id];
};

UserManager.prototype.exists = function(u) {
  var socket,
      session = this.sessions[u.uuid];
  if(session) {
    winston.info('[UserManager] User session exists');
    socket = this.sockets[session.socket];
    socket && socket.disconnect();
  }
  return session ? true : false;
};

UserManager.prototype.login = function(session) {
  var self = this,
      u = session.user,
      socket = this.sockets[session.socket],
      user = this.users[u.uuid];
  if(this.exists(u)) {
    socket && socket.disconnect();
  } else if(socket) {
    this.sessions[u.uuid] = session;
    user = this.users[u.uuid] = new User(this, u);
    user.init(function(err) {
      socket.emit('user', user.data.toStreamObject());
    });
  } else {
    winston.info('[UserManager] Could not not find socket');
  }
};

UserManager.prototype.logout = function(session) {
  var self = this,
      u = session.user || {},
      user = this.users[u.uuid],
      session = this.sessions[u.uuid],
      ships, len;
  if(user && session) {
    if(!user.data.isNewRecord()) {
      // don't release until
      // user is saved
      user.save(destroy);
    } else {
      destroy();
    }

    function destroy() {
      ships = user.ships;
      for(var s=0; s<ships.length; s++) {
        self.game.emit('ship/remove', ships[s]);
      }
      delete self.sessions[u.uuid];
      delete self.users[u.uuid];
    }
  }
};

UserManager.prototype.addShip = function(ship) {
  if(ship.user) {
    ship.user.ships.push(ship);
  }
};

UserManager.prototype.removeShip = function(ship) {
  var index, user;
  if(ship.user) {
    user = ship.user;
    index = user.ships.indexOf(ship);
    if(index > -1) {
      user.ships.splice(index, 1);
    }
  }
};

UserManager.prototype.update = function() {

};

module.exports = UserManager;
