var pixi = require('pixi'),
    Group = require('./Group');

function Batch(game, maxSize, properties, batchSize) {
  pixi.ParticleContainer.call(this, maxSize, properties, batchSize);

  this.game = game;
};

Batch.prototype = Object.create(pixi.ParticleContainer.prototype);
Batch.prototype.constructor = Batch;

Batch.prototype.update = function() {
  if(this.pendingDestroy) {
    this.destroy();
    return false;
  }

  if(!this.exists || !this.parent.exists) {
    this.renderOrderID = -1;
    return false;
  }

  var i = this.children.length;
  while (i--) {
    this.children[i].update();
  }
};

Batch.prototype.destroy = function(destroyChildren, soft) {
  if(this.game === null || this.ignoreDestroy) { return; }
  if(destroyChildren === undefined) { destroyChildren = true; }
  if(soft === undefined) { soft = false; }

  this.removeAll(destroyChildren);
  this.removeAllListeners();

  this.filters = null;
  this.pendingDestroy = false;

  if(!soft) {
    if(this.parent) {
      this.parent.removeChild(this);
    }
    this.game = null;
    this.exists = false;
  }  
};

module.exports = Batch;
