
var async = require('async'),
    Generator = require('../../utils/Generator'),
    Latency = require('../../utils/Latency'),
    EventEmitter = require('eventemitter3');

function User(game, data, socket, chassis, startingPosition) {
  this.game = game;
  this.model = game.model;
  this.socket = socket;

  this.latency = new Latency(this);
  this.data = new this.model.User(data);

  this.ships = [];
  this.stations = [];

  this.uuid = this.data.uuid;

  this.chassis = chassis;

  this.startingPosition = startingPosition;
};

User.prototype.constructor = User;

User.prototype.init = function(callback, context) {
  var self = this,
      game = this.game,
      data = this.data,
      socket = this.socket,
      ships = this.ships;
      // chassis = ['ubaidian-x01a','ubaidian-x01b','ubaidian-x01c','ubaidian-x01d','ubaidian-x01e','ubaidian-x01f']
  if(data.isNewRecord()) {
    // connect demo ship

    game.emit('ship/create', {
      // chassis: this.game.rnd.pick(chassis),
      chassis: this.chassis,
      x: this.startingPosition.x,
      y: this.startingPosition.y,
      uuid: this.uuid,
      squadron: {}
    }, this);

// 'ubaidian-x01d'
    // update client
    socket.emit('auth/sync', this.data.toStreamObject());

    // call callback
    callback.call(context);
  } else {
    async.series([
      data.reload.bind(data),
      data.ships.bind(data)
    ], function(err, results) {
      var data = results[0],
          ships = results[1];

      if(ships && ships.length) {
        for(var s=0; s<ships.length; s++) {
          if(ship.uuid === this.data.ship) {
            ship = ships[s].toStreamObject();

            // create user ship
            game.emit('ship/create', ship, this);
          }
        }
      }

    // call callback
      callback.call(context);
    });
  }
};

// User.prototype.create = function(ships) {
//   var data,
//       game = this.game,
//       rnd = game.rnd,
//       variations = ['a','b','c','d','e','f'];

//   if(ships && ships.length) {
//     for(var s=0; s<ships.length; s++) {
//       ship = ships[s];
//       data = ship.toStreamObject ? json : ship;

//       // set chassis
//       if(!data.chassis) {
//         data.chassis = 'ubaidian-x01' + rnd.pick(variations);        
//       }
//       data.squadron = {};
//       // create user ship
//       this.game.emit('ship/create', data, this);
//     }
//   }
// };

User.prototype.save = function(callback) {
  var self = this, ship,
      len = ships.length,
      series = [];
  
  // save user
  series.push(function(next) {
    self.data.updateAttributes({
      credits: self.data.credits,
      reputation: self.data.reputation
    }, next);
  });

  // save ships
  for(var s=0; s<len; s++) {
    ship = ships[s];
    series.push(ship.save.bind(ship));
  }

  // persist
  async.series(series, callback);
};

User.prototype.reconnected = function(socket) {
  this.socket = socket;
  this.socket.emit('auth/sync', this.data.toStreamObject());
  this.timeout && this.game.clock.events.remove(this.timeout);
};

User.prototype.disconnected = function() {
  this.timeout = this.game.clock.events.add(10000, this.destroy, this);
};

User.prototype.destroy = function() {
  var ship,
      ships = this.ships;

  // remove ships
  for(var s in ships) {
    this.game.emit('ship/remove', ships[s]);
  }

  // remove from manager
  this.game.emit('auth/remove', this);

  // destroy objects
  this.latency.destroy();

  // cleanup
  this.game = this.latency = this.stations =
    this.model = this.socket = undefined;
};

module.exports = User;
