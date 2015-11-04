
// var UserManager = require('./UserManager');

function SectorManager(game) {
  this.game = game;

  this.users = {};

  // this.game.clock.events.loop(2000, function() {
  //   io.sockets.emit('update', {
      
  //   });
  // });
};

SectorManager.prototype.constructor = SectorManager;

SectorManager.prototype.init = function() {
  
};

SectorManager.prototype.add = function(object) {
  switch(object.type) {
    case 'user':
      this.users[object.uuid] = object;
      break;
  }
};

SectorManager.prototype.remove = function(object) {
  switch(object.type) {
    case 'user':
      delete this.users[object.uuid];
      break;
  }
};

SectorManager.prototype.update = function() {
  //..
};

module.exports = SectorManager;
