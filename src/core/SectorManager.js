
function SectorManager(game) {
  this.game = game;
  this.model = game.model;
  this.winston = game.winston;
  this.io = game.sockets.io;

  this.users = {};
  this.ships = {};
};

SectorManager.prototype.constructor = SectorManager;

SectorManager.prototype.init = function() {
  var self = this;
  this.io.on('connection', function(socket) {
    var session = socket.handshake.session,
        user = session.user;
    self.add(user);
    socket.on('disconnect', function() {
      self.remove(user);
    });
  });
};

SectorManager.prototype.add = function(object) {
  var self = this;
  switch(object.type) {
    case 'ship':
      this.ships[object.uuid] = object;
      break;
    case 'user':
      this.users[object.uuid] = object;
      this.model.ship.getShipsByUid(object.uid, function(err, ships) {
        if(err) { throw new Error(err); }
        for(var s in ships) {
          self.ships[ships[s].uuid] = ships[s];
        }
      });
      break;
  }
};

SectorManager.prototype.remove = function(object) {
  switch(object.type) {
    case 'ship':
      delete this.ships[object.uuid];
      break;
    case 'user':
      delete this.users[object.uuid];
      break;
  }
};

SectorManager.prototype.update = function() {
  this.io.sockets.emit('update', {
  });
};

module.exports = SectorManager;
