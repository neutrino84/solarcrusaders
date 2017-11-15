
var Basic = require('./Basic'),
    Pirate = require('./Pirate'),
    Squadron = require('./Squadron');

function AI(manager) {
  this.manager = manager;
  this.game = manager.game;
  
  this.game.npcs = {};
  this.timer = this.game.clock.events.loop(500, this.update, this);
};

AI.prototype.constructor = AI;

AI.prototype.create = function(type, ship) {
  var ai = null,
      game = this.game,
      npcs = game.npcs;
  switch(type) {
    case 'basic':
      ai = new Basic(ship);
      break
    case 'pirate':
      ai = new Pirate(ship);
      break;
    case 'squadron':
      ai = new Squadron(ship);
      break;
    default:
      ai = null;
      break;
  }
  if(ai != null) {
    npcs[ship.uuid] = ship;
  }
  return ai;
};

AI.prototype.remove = function(ship) {
  var game = this.game,
      npcs = game.npcs;
  if(npcs[ship.uuid]) {
    delete npcs[ship.uuid];
  }
};

AI.prototype.update = function() {
  var game = this.game,
      npcs = game.npcs,
      npc;
  for(var s in npcs) {
    npc = npcs[s];

    if(!npc.disabled && npc.ai) {
      npc.ai.update();
  	}
  }
};

AI.prototype.destroy = function() {
  this.timer && this.game.clock.events.remove(this.timer);
  this.manager = this.game =
    this.game.npcs = undefined;
};

module.exports = AI;
