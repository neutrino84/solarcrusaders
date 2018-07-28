var winston = require('winston'),
    engine = require('engine'),
    User = require('./objects/User');

function UserManager(game, sectorManager) {
  this.game = game;
  this.model = game.model;
  this.sockets = game.sockets;
  this.sectorManager = sectorManager;

  this.game.users = {};

  // this.tutorialSpawns = [];
  this.tutorialPositions = [[-17000, -18000],[16000, 16000],[-18000, 17000],[20000, -14000]]
};

UserManager.prototype.constructor = UserManager;

UserManager.prototype.init = function() {
  // auth request
  this.sockets.on('auth/connect', this.connect, this);
  this.sockets.on('requesting/wave', this.waveRequest, this);
  this.sockets.on('updating/respawnMultiplier', this.updateRespawnMultiplier, this);

  // auth messaging
  this.game.on('auth/disconnect', this.disconnect, this);
  this.game.on('auth/remove', this.remove, this);

  // listen for user ship selection
  this.sockets.on('user/ship', this.ship, this);

  // user messaging
  this.game.on('user/add', this.add, this);
  this.game.on('user/remove', this.remove, this);
  this.game.on('game/over', this.clear, this);
  this.game.on('send_user_data', this.update, this);
  this.game.on('launch_from_tutorial', this.recreatePlayerShip, this);

  // update data interval
  // this.game.clock.events.loop(1000, this.update, this);
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
    user = new User(game, data, socket, this);
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
      data = args[1],
      station = stationManager.getStation('ubadian-station-x01'),
      startingPosition = station.movement.position, 
      tutorial = false, username;
  console.log('in usermanager args are ', args, 'user is ', user);
  
  if(args[3]){
    user.data.tutorial = true;
    user.reconnected(socket, true);
    var num = Math.floor(Math.random()*this.tutorialPositions.length),
        temp = (this.tutorialPositions.splice(num, 1))[0];
    if(this.tutorialPositions.length < 1){
      this.tutorialPositions = [[-17000, -18000],[16000, 16000],[-18000, 17000],[20000, -14000]]
    }
    // startingPosition = new engine.Point(temp[0], temp[1]);
    startingPosition = new engine.Point(16000, 16000);
    tutorial = [startingPosition.x, startingPosition.y];
  };

  if(args[4]){
    username = args[4]
  }else{
    username = 'charlie'
  }

  user && game.emit('ship/create', {
    chassis: args[1],
    x : startingPosition.x,
    y : startingPosition.y,
    squadron : {},
    tutorial: tutorial,
    username: username
  }, user);
};

UserManager.prototype.recreatePlayerShip = function(user_id){
    var game = this.game,
        // session = socket.request.session,
        stationManager = this.sectorManager.stationManager,
        user = game.users[user_id], cached_chassis = user.ship.chassis
        // data = args[1],
        station = stationManager.getStation('ubadian-station-x01'),
        startingPosition = station.movement.position;
    user && game.emit('ship/create', {
      chassis: cached_chassis,
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

UserManager.prototype.waveRequest = function(socket, args) {
  var uuid = args[1],
      response = [],
      wave;
      if(this.game.users[uuid]){
        wave = this.game.users[uuid].wave;
        response.push(uuid);
        response.push(wave);    
      };
  if(response.length){
    this.game.emit('wave/response', socket, response)
  };
};

UserManager.prototype.updateRespawnMultiplier = function(socket, args) {
  var uuid = args[1];

  if(this.game.users[uuid]){
    this.game.users[uuid].respawnMultiplier = args[2];
  };
};

UserManager.prototype.update = function() {
  var game = this.game,
      users = game.users,
      user, delta, update, stats, update,
      updates = [];
  for(var s in users) {
    user = users[s];
    if(users[s]){
      update = { uuid: user.uuid };
      if(user.ship){
        update.ship = user.ship.chassis;
      }
      update.wave = user.wave;
      updates.push(update)
    }
  };
  if(updates.length > 0) {
    game.emit('user/data', updates);
  }
};

UserManager.prototype.clear = function() {
  for(var i in this.game.users){
    this.remove(this.game.users[i])
  }
};

module.exports = UserManager;
