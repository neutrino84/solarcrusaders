
var engine = require('engine'),
    EventEmitter = require('eventemitter3');

function StationData(game, data) {
  engine.Class.mixin(data, this);

  this.game = game;
  this.config = {
    station: game.cache.getJSON('station-configuration', false)[data.chassis],
    hardpoint: game.cache.getJSON('item-configuration', false)['hardpoint']
  };

  EventEmitter.call(this);
};

StationData.prototype = Object.create(EventEmitter.prototype);
StationData.prototype.constructor = StationData;

StationData.prototype.update = function(data) {
  engine.Class.mixin(data, this);

  this.emit('data', data);
};

module.exports = StationData;
