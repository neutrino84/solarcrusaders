var pixi = require('pixi'),
	Group = require('./Group');

function Batch(game, maxSize, properties, batchSize) {
  pixi.ParticleContainer.call(this, maxSize, properties, batchSize);

  this.game = game;
};

Batch.prototype = Object.create(pixi.ParticleContainer.prototype);
Batch.prototype.constructor = Batch;

Batch.prototype.preUpdate = function() {};

Batch.prototype.update = function() {};

Batch.prototype.postUpdate = function() {};

Batch.prototype.getFirstExists = function(exists) {
  if(typeof exists !== 'boolean') {
    exists = true;
  }
  return this.iterate('exists', exists, Group.RETURN_CHILD);
};

Batch.prototype.iterate = function(key, value, returnType, callback, callbackContext, args) {
  if(returnType === Group.RETURN_TOTAL && this.children.length === 0) { return 0; }

  var total = 0;
  for(var i = 0; i < this.children.length; i++) {
    if(this.children[i][key] === value) {
      total++;

      if(callback) {
        if(args) {
          args[0] = this.children[i];
          callback.apply(callbackContext, args);
        } else {
          callback.call(callbackContext, this.children[i]);
        }
      }

      if(returnType === Group.RETURN_CHILD) {
        return this.children[i];
      }
    }
  }

  if(returnType === Group.RETURN_TOTAL) {
    return total;
  }

  // RETURN_CHILD or RETURN_NONE
  return null;
};

module.exports = Batch;
