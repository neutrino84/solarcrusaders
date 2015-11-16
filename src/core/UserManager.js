
var uuid = require('uuid'),
    engine = require('engine')
    client = require('client');

function UserManager(game) {
  this.game = game;
  this.model = game.model;
  this.winston = game.winston;

  this.users = {};

  this.game.on('auth/login', this.add, this);
  this.game.on('auth/logout', this.remove, this);
};

UserManager.prototype.constructor = UserManager;

UserManager.prototype.init = function() {
  var self = this;
};

UserManager.prototype.add = function(user) {

  this.winston.info('login' + user.uid);

  // this.users[object.uuid] = object;
  // this.users[object.uuid].ships = [];

  // if(object.uid > 0) {
  //   this.model.ship.getShipsByUid(object.uid, function(err, ships) {
  //     if(err) { throw new Error(err); }
  //     for(var s in ships) {
  //       ship = self.ships[ships[s].uuid] = ships[s];
  //       ship.user = object;
  //       ship.game = self.game;
  //       ship.human = true;
  //       ship.throttle = global.parseInt(ship.throttle, 10);
  //       ship.position = new engine.Point(global.parseInt(ship.x, 10), global.parseInt(ship.y, 10));
  //       ship.rotation = global.parseInt(ship.rotation, 10);
  //       ship.config = engine.ShipConfiguration[ship.chasis];
  //       ship.movement = new client.Movement(ship);

  //       object.ships.push(ship.uuid);
  //     }
  //   });
  // } else {

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

  //   this.count++;
  // }
};

UserManager.prototype.remove = function(user) {

  this.winston.info('logout' + user.uid);

  // if(!this.users[object.uuid]) { return; }

  // ships = this.users[object.uuid].ships;

  // for(var uid in ships) {
  //   this.remove({
  //     type: 'ship',
  //     uuid: ships[uid]
  //   });
  // }
  // delete this.users[object.uuid];
};

UserManager.prototype.update = function() {

};

module.exports = UserManager;
