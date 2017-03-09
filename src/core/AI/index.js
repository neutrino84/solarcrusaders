
var Basic = require('./Basic'),
    Pirate = require('./Pirate');

function AI(manager) {
  this.manager = manager;
  this.game = manager.game;
  this.game.clock.events.loop(1000, this.update, this);
};

AI.prototype.constructor = AI;

AI.prototype.create = function(type, ship) {
  switch(type) {
    case 'basic':
      return new Basic(ship);
    case 'pirate':
      return new Pirate(ship);
    default:
      return null;
  }
};

AI.prototype.update = function() {
  var ship,
      ships = this.manager.ships;
  for(var s in ships) {
    ship = ships[s];

    if(!ship.disabled && ship.ai) {
      ship.ai.update();
  	}
  }
};

module.exports = AI;
