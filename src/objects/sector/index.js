
// var UserManager = require('./UserManager');

function Sector(game) {
  this.game = game;

  this._users = {};

  // this.game.clock.events.loop(2000, function() {
  //   io.sockets.emit('update', {
      
  //   });
  // });
};

Sector.prototype.constructor = Sector;

Sector.prototype.init = function() {

};

Sector.prototype.add = function(object) {
  switch(object.type) {
    case 'user':
      this._users[object.uuid] = object;
      break;
  }
};

Sector.prototype.remove = function(object) {
  switch(object.type) {
    case 'user':
      delete this._users[object.uuid];
      break;
  }
};

Sector.prototype.update = function() {
  //..
};

module.exports = Sector;
