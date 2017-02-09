var Emitter = require('./Emitter');

function ParticleManager(game) {
  this.game = game;
  this.emitters = {};
  this.ID = 0;
};

ParticleManager.prototype = {
  add: function(emitter) {
    this.emitters[emitter.name] = emitter;
    return emitter;
  },

  remove: function(emitter) {
    delete this.emitters[emitter.name];
  },

  update: function() {
    for(var key in this.emitters) {
      if(this.emitters[key].visible) {
        this.emitters[key].update();
      }
    }
  }
};

ParticleManager.prototype.constructor = ParticleManager;

module.exports = ParticleManager;
