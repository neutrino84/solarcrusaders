var Emitter = require('./Emitter');

function ParticleManager(game) {
  this.game = game;
  this.game.emitters = {};
};

ParticleManager.prototype = {
  add: function(emitter) {
    this.game.emitters[emitter.name] = emitter;
  },

  remove: function(emitter) {
    delete this.game.emitters[emitter.name];
  },

  update: function() {
    var game = this.game,
        emitters = game.emitters;
    for(var key in emitters) {
      if(emitters[key].visible) {
        emitters[key].update();
      }
    }
  }
};

ParticleManager.prototype.constructor = ParticleManager;

module.exports = ParticleManager;
