
var engine = require('engine'),
    pixi = require('pixi'),
    Shockwave = require('./Shockwave');

function ShockwaveManager(game) {
  this.game = game;
  this.shockwavesGroup = new engine.Group(game);
  
  this.actives = [];
  this.cache = [];

  // listen to messaging
  this.game.on('fx/shockwave', this.create, this);
};

ShockwaveManager.prototype.constructor = ShockwaveManager;

ShockwaveManager.prototype.create = function(data) {
  // create shockwave
  var game = this.game,
      cache = this.cache,
      actives = this.actives,
      shockwave = this.cache.pop() || new Shockwave(this);

  // add to actives
  actives.push(shockwave);
  shockwave.start(data);
  
  // add to world
  game.world.front.add(shockwave);
};

ShockwaveManager.prototype.remove = function(shockwave) {
  var game = this.game,
      cache = this.cache,
      actives = this.actives;

  engine.Utility.splice(actives, actives.indexOf(shockwave));
  cache.push(shockwave);
  
  game.world.front.remove(shockwave);
};

ShockwaveManager.prototype.preRender = function() {
  var actives = this.actives,
      i = actives.length;
  while(i--) {
    actives[i].preRender();
  }
};

module.exports = ShockwaveManager;
