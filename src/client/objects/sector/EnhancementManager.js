
function EnhancementManager(game) {
  this.game = game;
  this.socket = game.net.socket;

  // subscribe to messaging
  this.game.on('ship/enhancement/start', this.start, this);
  this.game.on('ship/enhancement/started', this.started, this);
  this.game.on('ship/enhancement/stopped', this.stopped, this);
};

EnhancementManager.prototype.start = function(data) {
  this.socket.emit('ship/enhancement/start', data);
};

EnhancementManager.prototype.started = function(data) {
  var ship = this.game.ships[data.uuid];
  if(ship !== undefined) {
    switch(data.enhancement) {
      case 'heal':
        ship.repair.start();
        break;
      case 'booster':
        ship.engineCore.start();
        break;
      case 'shield':
        ship.shieldGenerator.start();
        break;
    }
  }
};

EnhancementManager.prototype.stopped = function(data) {
  var ship = this.game.ships[data.uuid];
  if(ship !== undefined) {
    switch(data.enhancement) {
      case 'heal':
        ship.repair.stop();
        break;
      case 'booster':
        ship.engineCore.stop();
        break;
      case 'shield':
        ship.shieldGenerator.stop();
        break;
    }
  }
};

EnhancementManager.prototype.destroy = function() {
  this.game.removeListener('ship/enhancement/start', this.start);
  this.game.removeListener('ship/enhancement/started', this.started);
  this.game.removeListener('ship/enhancement/stopped', this.stopped);

  // destroy variable
  // references
  this.game = this.socket = undefined;
};

module.exports = EnhancementManager
