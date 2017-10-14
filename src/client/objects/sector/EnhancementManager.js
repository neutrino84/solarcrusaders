
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
        ship.hud.show();
        ship.hud.timer && ship.events.remove(ship.hud.timer);
        ship.hud.timer = ship.events.add(4000, ship.hud.hide, ship.hud);
        break;
      case 'booster':
        ship.engineCore.start();
        ship.showHud(4000);
        break;
      case 'shield':
        ship.shieldGenerator.start();
        ship.showHud(2000);
        break;
      case 'piercing':
        ship.targetingComputer.enhance(data.enhancement, true);
        ship.showHud(2000);
        break;
      case 'detect':
        ship.targetingComputer.enhance(data.enhancement, true);
        ship.showHud(2000);
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
      case 'detect':
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
