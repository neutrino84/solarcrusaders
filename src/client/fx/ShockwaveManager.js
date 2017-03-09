
var engine = require('engine'),
    Shockwave = require('./Shockwave');

function ShockwaveManager(game) {
  this.game = game;
  this.shockwavesGroup = new engine.Group(game);

  // add to display
  this.game.world.add(this.shockwavesGroup);

  // listen to messaging
  this.game.on('fx/shockwave', this.create, this);
};

ShockwaveManager.prototype.constructor = ShockwaveManager;

ShockwaveManager.prototype.create = function(properties) {
  var game = this.game,
      shockwave = new Shockwave(game, properties.width || 2048, properties.height || 2048);
      shockwave.start(properties);
  this.shockwavesGroup.add(shockwave);
};

ShockwaveManager.prototype.preRender = function() {
  var group = this.shockwavesGroup,
      i = group.children.length;
  while(i--) {
    group.children[i].preRender();
  }
};

module.exports = ShockwaveManager;
