
var Basic = require('./Basic'),
    Pirate = require('./Pirate'),
    Squadron = require('./Squadron'),
    Scavenger = require('./Scavenger');

function AI(manager) {
  this.manager = manager;
  this.game = manager.game;
  this.timer = this.game.clock.events.loop(500, this.update, this);
  this.ships = {};
};

AI.prototype.constructor = AI;

AI.prototype.create = function(type, ship) {
  var ai = null;
  switch(type) {
    case 'basic':
      ai = new Basic(ship);
      break
    case 'pirate':
      ai = new Pirate(ship);
      break;
    case 'scavenger':
      ai = new Scavenger(ship);
      break;
    case 'squadron':
      ai = new Squadron(ship);
      break;
    default:
      ai = null;
      break;
  }
  if(ai != null) {
    this.ships[ship.uuid] = ship;
  }
  return ai;
};

AI.prototype.update = function() {
  var ship,
      ships = this.ships;
  for(var s in ships) {
    ship = ships[s];

    if(!ship.disabled && ship.ai) {
      ship.ai.update();
  	}
  }
};

AI.prototype.destroy = function() {
  this.timer && this.game.clock.events.remove(this.timer);
  this.manager = this.game = undefined;
};

module.exports = AI;
