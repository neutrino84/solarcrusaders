
var engine = require('engine'),
    EventEmitter = require('eventemitter3');

ShipData.STAT_UNITS = {
  'durability': 'hp',
  'health':     'hp',
  'heal':       'hp',
  'capacity':   'm',
  'speed':      'm',
  'energy':     'gj',
  'recharge':   'gj',
  'armor':      'hp',
  'range':      'm',
  'rate':       's',
  'evasion':    '%',
  'critical':   '%'
};

function ShipData(game, data) {
  engine.Class.mixin(data, this);

  this.game = game;

  this.config = {
    units: ShipData.STAT_UNITS,
    ship: game.cache.getJSON('ship-configuration', false)[data.chassis],
    enhancement: game.cache.getJSON('item-configuration')['enhancement']
  };

  EventEmitter.call(this);
};

ShipData.prototype = Object.create(EventEmitter.prototype);
ShipData.prototype.constructor = ShipData;

ShipData.prototype.update = function(data) {
  engine.Class.mixin(data, this);

  this.emit('data', data);
};

module.exports = ShipData;
