
function EnhancementManager(parent) {
  this.manager = parent;
  this.game = parent.game;
  this.socket = parent.socket;

  // subscribe to messaging
  this.game.on('ship/enhancement/start', this._start, this);
  this.game.on('ship/enhancement/started', this._started, this);
  this.game.on('ship/enhancement/stopped', this._stopped, this);
};

EnhancementManager.prototype._start = function(data) {
  this.socket.emit('ship/enhancement/start', data);
};

EnhancementManager.prototype._started = function(data) {
  var ship = this.manager.ships[data.uuid];
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
      case 'piercing':
        ship.targetingComputer.enhance(data.enhancement, true);
        break;
    }
  }
};

EnhancementManager.prototype._stopped = function(data) {
  var ship = this.manager.ships[data.uuid];
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
      case 'piercing':
        ship.targetingComputer.enhance(data.enhancement, false);
        break;
    }
  }
};

EnhancementManager.prototype.destroy = function() {
  this.game.removeListener('ship/enhancement/start', this._start);
  this.game.removeListener('ship/enhancement/started', this._started);
  this.game.removeListener('ship/enhancement/stopped', this._stopped);

  this.manager = this.game =
    this.socket = undefined;
};

module.exports = EnhancementManager
