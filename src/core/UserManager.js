
var winston = require('winston'),
    User = require('./objects/User');

function UserManager(game, sectorManager) {
  this.game = game;
  this.model = game.model;
  this.sockets = game.sockets;
  this.sectorManager = sectorManager;

  this.game.users = {};
};

UserManager.prototype.constructor = UserManager;

UserManager.prototype.init = function() {
  // auth request
  this.sockets.on('auth/connect', this.connect, this);

  // auth messaging
  this.game.on('auth/disconnect', this.disconnect, this);
  this.game.on('auth/remove', this.remove, this);

  // listen for user ship selection
  this.sockets.on('user/ship', this.ship, this);

  // user messaging
  this.game.on('user/add', this.add, this);
  // this.game.on('game/over', this.clear, this);
};

UserManager.prototype.add = function(user) {
  this.game.users[user.uuid] = user;
};

UserManager.prototype.remove = function(user) {
  delete this.game.users[user.uuid];
};

UserManager.prototype.connect = function(socket) {
  var user,
      game = this.game,
      users = game.users,
      session = socket.request.session,
      data = session ? session.user : undefined;
  if(data && users[data.uuid] && users[data.uuid].socket) {
    winston.info('[UserManager] User already exists in game');
    user = users[data.uuid];
    user.reconnected(socket);
  } else if(data && socket) {
    winston.info('[UserManager] Creating user in game');
    user = new User(game, data, socket);
    user.init(function() {
      game.emit('user/add', user);
    }, this);
  } else {
    winston.info('[UserManager] User data error');
    socket.disconnect(true);
  }
};

UserManager.prototype.disconnect = function(socket) {
  var game = this.game,
      session = socket.request.session,
  user = game.users[session.user.uuid];
  user && user.disconnected();
};

UserManager.prototype.ship = function(socket, args) {
  var game = this.game,
      stationManager = this.sectorManager.stationManager,
      session = socket.request.session,
      user = game.users[session.user.uuid],
      data = args[1];
      var station = stationManager.getStation('ubadian-station-x01');
      var startingPosition = station.movement.position;

  user && game.emit('ship/create', {
    chassis: args[1],
    x : startingPosition.x,
    y : startingPosition.y,
    squadron : {}
  }, user);
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

UserManager.prototype.clear = function() {
  for(var i in this.game.users){
    console.log(this.game.users[i])
    this.game.users[i].ship = null;
  }
};

module.exports = UserManager;
