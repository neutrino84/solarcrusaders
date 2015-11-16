
var uuid = require('uuid'),
    engine = require('engine')
    client = require('client');

function UserManager(game) {
  this.game = game;
  this.model = game.model;
  this.winston = game.winston;
  this.sockets = game.sockets;

  this.users = {};

  this.game.on('auth/login', this.add, this);
  this.game.on('auth/logout', this.remove, this);

  this.game.on('user/ship/add', this.addShip, this);
  this.game.on('user/ship/remove', this.removeShip, this);
};

UserManager.prototype.constructor = UserManager;

UserManager.prototype.init = function() {
  var self = this;
};

UserManager.prototype.add = function(user) {
  if(this.users[user.uuid]) { return; }

  var self = this,
      u = this.users[user.uuid] = user;
      u.ships = [];

  if(user.uid > 0) {
    this.model.ship.getShipsByUid(user.uid, function(err, ships) {
      if(err) { throw new Error(err); }
      for(var s in ships) {
        ships[s].user = user;
        self.game.emit('ship/add', ships[s]);
      }
    });
  } else {
  //   uid = uuid.v4();
  //   ship = self.ships[uid] = {
  //     uuid: uid,
  //     chasis: 'vessel-x04',
  //     sector: 1
  //   };
  //   ship.user = object;
  //   ship.game = self.game;
  //   ship.human = true;
  //   ship.throttle = engine.ShipConfiguration[ship.chasis].speed;
  //   ship.position = new engine.Point(2048, 2048);
  //   ship.rotation = global.Math.random() * global.Math.PI;
  //   ship.config = engine.ShipConfiguration[ship.chasis];
  //   ship.movement = new client.Movement(ship);

  //   object.ships.push(ship.uuid);
  }
};

UserManager.prototype.remove = function(user) {
  if(!this.users[user.uuid]) { return; }

  var u = this.users[user.uuid],
      ships = u.ships;
  for(var s in ships) {
    this.game.emit('ship/remove', ships[s]);
    ships[s] = undefined;
  }

  ships = undefined;

  delete this.users[user.uuid];
};

UserManager.prototype.addShip = function() {

};

UserManager.prototype.removeShip = function() {

};

UserManager.prototype.update = function() {

};

module.exports = UserManager;
