
var winston = require('winston'),
    User = require('./objects/User');

function UserManager(game) {
  this.game = game;
  this.model = game.model;
  this.sockets = game.sockets;

  this.staging = {};

  this.users = {};
};

UserManager.prototype.constructor = UserManager;

UserManager.prototype.init = function() {
  // auth request
  this.sockets.on('auth/connect', this.connect, this);

  // auth messaging
  this.game.on('auth/disconnect', this.disconnect, this);
  this.game.on('auth/remove', this.remove, this);

  // user messaging
  this.game.on('user/add', this.add, this);

  
  this.sockets.on('user/shipSelected', this.shipSelected, this);
};

UserManager.prototype.shipSelected = function(socket, args){
  console.log('in user manager test, ship is ', args[1], args[2])
  if(this.staging[args[2]]){
    this.staging[args[2]].chassis = args[1]
  }
  console.log('got  here!!!', this.staging)
  this.create(this.staging[args[2]])
}

UserManager.prototype.add = function(user) {
  this.users[user.uuid] = user;
};

UserManager.prototype.remove = function(user) {
  delete this.users[user.uuid];
};

UserManager.prototype.connect = function(socket) {
  var user,
      session = socket.request.session,
      data = session ? session.user : false;
      // console.log('in connect, data is ', data, 'session is ', session, 'socket is ', socket)
  if(data) {
    if(this.exists(data)) {
      winston.info('[UserManager] User already exists in game');
      user = this.users[data.uuid];
      user.reconnected(socket);
    } else if(data && socket && session) {
      //will have to adjust this step for when they relogged in but haven't yet chosen a ship
      // console.log('user.uuid is ', session.user.uuid)
      if(!this.staging[socket.id]){
        this.staging[socket.id] = {
          data : data,
          socket : socket,
          chassis : 0
        } 
        console.log(this.staging[socket.id].socket.id)
      }

      // if(this.staging.indexOf(session.user.uuid) < 0){
      //   this.staging.push(session.user.uuid)
      // }

      // winston.info('[UserManager] Creating user in game');
      // this.test();
      // user = new User(this.game, data, socket);
      // user.init(function() {
      //   this.game.emit('user/add', user);
      // }, this);
    } else {
      winston.info('[UserManager] User data error');
      socket.disconnect(true);
    }
  } else {
    winston.info('[UserManager] User data error');
    socket.disconnect(true);
  }
};

UserManager.prototype.create = function(data){
  console.log('moley',data)
  winston.info('[UserManager] Creating user in game');
  user = new User(this.game, data.data, data.socket, data.chassis);
  user.init(function() {
    this.game.emit('user/add', user);
  }, this);
}

UserManager.prototype.disconnect = function(socket) {
  var session = socket.request.session,
      user = this.users[session.user.uuid];
      user && user.disconnected();
};

UserManager.prototype.all = function(uuids) {
  var user,
      users = [];
  for(var u in this.users) {
    user = this.users[u];
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
      users = [];
  for(var u in uuids) {
    user = this.users[uuids[u]];
    if(user) {
      users.push({
        uuid: user.uuid,
        name: user.data.name,
        username: user.data.username
      });
    }
  }
  return users;
};

UserManager.prototype.update = function() {
  var users = this.users,
      user, delta, update, stats,
      updates = [];
  for(var s in users) {
    user = users[s];
  }
  if(updates.length > 0) {
    this.game.emit('user/data', {
      type: 'update', users: updates
    });
  }
};

UserManager.prototype.exists = function(user) {
  return user && this.users[user.uuid] && this.users[user.uuid].socket ? true : false;
};

module.exports = UserManager;
