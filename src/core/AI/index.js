
var Basic = require('./Basic'),
    Pirate = require('./Pirate'),
    Squadron = require('./Squadron'),
    User = require('./User');

function AI(game) {
  this.game = game;

  // global npcs
  this.game.npcs = {};
};

AI.prototype.constructor = AI;

AI.prototype.init = function() {
  this.game.on('ship/remove', this.remove, this);
};

AI.prototype.factory = function(ship) {
  var ai = null,
      game = this.game,
      npcs = game.npcs;
  switch(ship.data.ai) {
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
      ai = ship.user ? new User(ship) : null;
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

    if(npc && !npc.disabled) {
      npc.ai.update();
  	}
  }
};

AI.prototype.destroy = function() {
  this.game = this.game.npcs = undefined;
};

module.exports = AI;
