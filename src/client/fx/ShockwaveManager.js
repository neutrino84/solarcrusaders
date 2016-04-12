
var engine = require('engine'),
    Shockwave = require('./Shockwave');

function ShockwaveManager(game, state) {
  this.game = game;
  this.state = state;
  this.shockwavesGroup = new engine.Group(game);

  // add to display
  this.game.world.add(this.shockwavesGroup);

  // listen to messaging
  this.game.on('fx/shockwave', this.create, this);
};

ShockwaveManager.prototype.constructor = ShockwaveManager;

ShockwaveManager.prototype.create = function(properties) {
  var game = this.game,
      shockwave = new Shockwave(game, properties.width || 1024, properties.height || 1024);
      shockwave.position.set(properties.x, properties.y);
      shockwave.start(properties);
  this.shockwavesGroup.add(shockwave);
};

ShockwaveManager.prototype.preRender = function() {
  var group = this.shockwavesGroup,
      i = group.children.length;
  while(i--) {
    group.children[i].preRender(this.state.space);
  }
};

module.exports = ShockwaveManager;
