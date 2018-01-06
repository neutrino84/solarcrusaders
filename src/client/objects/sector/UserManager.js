
var engine = require('engine'),
    User = require('./User'),
    ExplosionEmitter = require('./emitters/ExplosionEmitter'),
    FlashEmitter = require('./emitters/FlashEmitter'),
    GlowEmitter = require('./emitters/GlowEmitter'),
    ShockwaveEmitter = require('./emitters/ShockwaveEmitter'),
    FireEmitter = require('./emitters/FireEmitter');

function UserManager(game, state) {
  this.game = game;
  this.state = state;
  this.socket = game.net.socket;
  this.usersGroup = new engine.Group(game);

  // users
  this.users = {};

  // listen to messaging
  this.game.on('auth/disconnect', this.disconnect, this);
  this.game.on('sector/sync', this.sync, this);
}

UserManager.prototype.constructor = UserManager;

UserManager.prototype.create = function(data) {
  var game = this.game,
      state = this.state,
      users = this.users,
      container = this.usersGroup;
      user = new User(this, data);
  // console.log('data is ', data)

  // set data
  user.uuid = data.uuid;
  user.boot();

  // add user registry
  users[data.uuid] = user;
};
UserManager.prototype.sync = function(data) {
  var game = this.game,
      netManager = this.state.netManager,
      users = data.users,
      length = users.length,
      sync, user, model;
  for(var s=0; s<length; s++) {
    sync = users[s];
    user = this.users[sync.uuid];

    if(user) {
      // console.log('user exists')
      // user.plot(sync);
    } else if(netManager){
      model = netManager.getUserData(sync.uuid);
      model && this.create(model);
    }
  }
};

UserManager.prototype.update = function() {
  // var game = this.game,
  //     users = this.users,
  //     user, delta, update, stats,
  //     updates = [];
  // for(var s in users) {
  //   user = users[s];
    
  //   if(!user.disabled) {
  //     stats = user.config.stats;
  //     update = { uuid: user.uuid };

  //     // update health
  //     if(user.health < stats.health) {
  //       delta = user.heal;
  //       user.health = global.Math.min(stats.health, user.health + delta);
  //       update.health = engine.Math.roundTo(user.health, 1);
  //     }

  //     // push deltas
  //     if(delta !== undefined) {
  //       updates.push(update);
  //     }
  //   }
  // }
  // if(updates.length > 0) {
  //   game.emit('user/data', updates);
  // }
};

UserManager.prototype.remove = function(data) {
  var users = this.users,
      user = users[data.uuid];
  if(user !== undefined) {
    user.destroy();
    delete users[user.uuid];
  }
};

UserManager.prototype.removeAll = function() {
  var user,
      users = this.users;
  for(var s in users) {
    this.remove(users[s]);
  }
  this.users = {};
};

UserManager.prototype.find = function(chassis) {
  var users = this.users,
      user;

  for(var s in users) {
    if(users[s].data.chassis == chassis){
      return users[s]
    }
  }
};

// UserManager.prototype.destroy = function() {
//   this.game.removeListener('auth/disconnect', this.disconnect);
//   this.game.removeListener('sector/sync', this.sync);

//   this.removeAll();

//   this.game = this.socket = this._syncBind =
//    this._attackBind = undefined;
// };

UserManager.prototype.disconnect = function() {
    this.game.removeListener('auth/disconnect', this.disconnect);
  this.game.removeListener('sector/sync', this.sync);
  this.removeAll();
   this.game = this.socket = this._syncBind =
   this._attackBind = undefined;
};

module.exports = UserManager;
