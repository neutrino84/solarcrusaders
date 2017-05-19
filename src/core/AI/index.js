
var Basic = require('./Basic'),
    Pirate = require('./Pirate'),
    Squadron = require('./Squadron'),
    Scavenger = require('./Scavenger');

function AI(manager) {
  this.manager = manager;
  this.game = manager.game;
  this.timer = this.game.clock.events.loop(500, this.update, this);
  this.ships = manager.ships;
  this.consumed = {};
  this.queenThreshold = 500;
  this.next = 1000;

  // this.game.on('squad/engageHostile', this.squad_engage, this);
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

AI.prototype.squad_engage = function(socket, args){
  var ships = this.ships;

    for (var s in ships){
      ship = ships[s];
      if(ship.chassis === 'squad-attack' && ship.master === args[1].player_id && ships[args[1].target_id]){
        var target = ships[args[1].target_id];
        ship.ai.engage(target);
      };
    };
};

AI.prototype.queenCheck = function(durability, uuid){
  if(!this.consumed[uuid]){
    this.consumed[uuid] = uuid  
    this.queenThreshold = this.queenThreshold - durability;
  }
  
  if(this.queenThreshold < 1){
    console.log('SPAWN QUEEN')
    this.manager.spawnQueen();
    this.queenThreshold = this.next;
    this.next = this.next + 500;
  };
}

AI.prototype.destroy = function() {
  this.timer && this.game.clock.events.remove(this.timer);
  this.manager = this.game = undefined;
};

module.exports = AI;
