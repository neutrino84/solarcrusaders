
var Basic = require('./Basic'),
    Pirate = require('./Pirate'),
    Squadron = require('./Squadron'),
    Enforcer = require('./Enforcer'),
    Scavenger = require('./Scavenger');

function AI(manager) {
  this.manager = manager;
  this.game = manager.game;
  this.timer = this.game.clock.events.loop(500, this.update, this);
  this.ships = manager.ships;
  this.consumed = {};
  this.queenThreshold = 300;
  this.next = 400;
  this.queenSpawnCycle = 0;

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
    case 'enforcer':
      ai = new Enforcer(ship);
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
    // console.log('SPAWN QUEEN, cycle is at ', this.queenSpawnCycle);
    this.queenSpawnCycle % 2 === 0 ? this.manager.spawnQueen('bottom') : this.manager.spawnQueen('top')
    // this.manager.spawnQueen();
    this.queenThreshold = this.next;
    this.next = this.next + 500;
    this.queenSpawnCycle++
    if(this.queenThreshold > 2000){
      this.queenThreshold = 300;
      this.next = 400;
      this.queenSpawnCycle = 0;
    }
  };
}

AI.prototype.destroy = function() {
  this.timer && this.game.clock.events.remove(this.timer);
  this.manager = this.game = undefined;
};

module.exports = AI;
