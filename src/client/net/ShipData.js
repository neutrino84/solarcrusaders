
var engine = require('engine')
    EventEmitter = require('eventemitter3');

function ShipData(game, data) {
  engine.Class.mixin(data, this);

  this.game = game;
  this.config = game.cache.getJSON('ship-configuration', false)[data.chasis];

  EventEmitter.call(this);
};

ShipData.prototype = Object.create(EventEmitter.prototype);
ShipData.prototype.constructor = ShipData;

ShipData.prototype.update = function(data) {
  engine.Class.mixin(data, this);

  this.emit('data', data);
};

module.exports = ShipData;
