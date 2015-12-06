var pixi = require('pixi');

function Batch(game, maxSize, properties, batchSize) {
  pixi.ParticleContainer.call(this, maxSize, properties, batchSize);

  this.game = game;
};

Batch.prototype = Object.create(pixi.ParticleContainer.prototype);
Batch.prototype.constructor = Batch;

module.exports = Batch;
