
var winston = require('winston'),
    User = require('./objects/User');

function UserManager(game) {
  this.game = game;
  this.model = game.model;
  this.sockets = game.sockets;

  this.game.users = {};
};

UserManager.prototype.constructor = UserManager;

UserManager.prototype.init = function() {
  // auth request
  this.sockets.on('auth/connect', this.connect, this);
  this.sockets.on('user/ship', this.ship, this);

  // auth messaging
  this.game.on('auth/disconnect', this.disconnect, this);
};

UserManager.prototype.connect = function(socket) {
  var user,
      game = this.game,
      session = socket.request.session,
      users = game.users,
      station = game.events.primary('stations', 'ubaidian');

  if(session && session.user) {
    user = users[session.user.uuid];

    if(user) {
      winston.info('[UserManager] Reconnecting an existing user to socket');

      // connect user socket
      user.reconnected(socket);
    } else {
      winston.info('[UserManager] Connecting a new user to socket');

      // create new user
      user = new User(game, session.user);
      user.init(function() {
        // add to world
        users[user.uuid] = user;

        // create dev ship
        game.emit('ship/create', {
          user: user.uuid,
          station: station.uuid,
          chassis: 'ubaidian-x08',
          squadron: [
            'ubaidian-x06', 'ubaidian-x06'
          ]
        });

        // connect user socket
        user.reconnected(socket);
      }, this);
    }
  } else {
    winston.error('[UserManager] An error occurred connecting socket to user');

    // errant socket disconnect
    this.disconnect(socket);
  }
};

UserManager.prototype.disconnect = function(socket) {
  var game = this.game,
      session = socket.request.session,
      uuid = session.user && session.user.uuid,
      user = game.users[uuid];

  // disconnect user
  user && user.disconnected();
};

UserManager.prototype.ship = function(socket, args) {
  var game = this.game,
      session = socket.request.session,
      user = game.users[session.user.uuid],
      data = args[1],
      station = game.events.primary('stations', 'ubaidian');

  // create ships
  if(user && user.ship == null) {
    game.emit('ship/create', {
      user: user.uuid,
      station: station.uuid,
      chassis: data.name,
      squadron: ['ubaidian-x06', 'ubaidian-x06']
    });
  }
};

UserManager.prototype.all = function(uuids) {
  var user,
      users = [],
      game = this.game;
  for(var u in game.users) {
    user = game.users[u];
    users.push({
      uuid: user.uuid,
      name: user.data.name,
      username: user.data.username
    });
  }
  return users;
};

UserManager.prototype.data = function(uuids) {
  var user,
      users = [],
      game = this.game;
  for(var u in uuids) {
    user = game.users[uuids[u]];
    if(user) {
      users.push({
        uuid: user.uuid,
        name: user.data.name,
        username: user.data.username,
        credits: user.credits
      });
    }
  }
  return users;
};

UserManager.prototype.update = function() {
  var game = this.game,
      users = game.users,
      user, delta, update, stats,
      updates = [];
  for(var s in users) {
    user = users[s];
  }
  if(updates.length > 0) {
    game.emit('user/data', {
      type: 'update', users: updates
    });
  }
};

module.exports = UserManager;
