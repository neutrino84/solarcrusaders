
var Basic = require('./Basic'),
    Pirate = require('./Pirate'),
    Squadron = require('./Squadron'),
    Scavenger = require('./Scavenger'),
    Enforcer = require('./Enforcer');

function AI(manager, events) {
  this.manager = manager;
  this.game = manager.game;
  this.events = events;
  this.timer = this.game.clock.events.loop(500, this.update, this);
  this.ships = {};
  this.consumed = {};
  this.queenThreshold = 150;
  this.next = 900;
  this.queenSpawnCycle = 0;
  this.queenCount = 0;

  this.game.on('queen/death', this.queenDeath, this);
  this.game.on('game/over', this.restart, this);
};

AI.prototype.constructor = AI;

AI.prototype.create = function(type, ship, faction) {
  var ai = null;
  switch(type) {
    case 'basic':
      ai = new Basic(ship);
      break
    case 'pirate':
      ai = new Pirate(ship, faction);
      break;
    case 'scavenger':
      ai = new Scavenger(ship, faction);
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

AI.prototype.queenCheck = function(durability, uuid){
  
  if(!this.consumed[uuid]){
    this.consumed[uuid] = uuid  
    this.queenThreshold = this.queenThreshold - durability;
  }
  
  if(this.queenThreshold < 1 && this.queenCount < 3){
    this.events.spawnQueen(this.queenSpawnCycle);
    this.queenThreshold = this.next;
    this.next = this.next + 500;
    this.queenSpawnCycle++
    this.queenCount++
    if(this.queenThreshold > 3500){
      this.queenThreshold = 300;
      this.next = 400;
      this.queenSpawnCycle = 0;
    }
  };
};

AI.prototype.queenDeath = function(){
  this.queenCount --
}

AI.prototype.restart = function(){
  this.ships = {};
  this.consumed = {};
  this.queenThreshold = 150;
  this.next = 900;
  this.queenSpawnCycle = 0;
  this.queenCount = 0;
}

AI.prototype.destroy = function() {
  this.timer && this.game.clock.events.remove(this.timer);
  this.manager = this.game = undefined;
};

module.exports = AI;
