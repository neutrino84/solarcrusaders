
var engine = require('engine')
    EventEmitter = require('eventemitter3');

ShipData.SYSTEM_SORT_ORDER = ['hull', 'reactor', 'pilot', 'engine', 'shield', 'targeting'];

ShipData.STAT_UNITS = {
  'durability': 'hp', 'health': 'hp', 'heal': '%',
  'speed': 'km', 'evasion': '%',
  'energy': 'gj', 'recharge': 'gj',
  'armor': 'hp', 'range': 'km',
  'accuracy': '%', 'critical': '%'
};

ShipData.STAT_SYSTEM_BINDING = {
  'durability': 'hull',
  'health': 'hull',
  'heal': 'hull',
  'speed': 'engine',
  'evasion': 'pilot',
  'energy': 'reactor',
  'recharge': 'reactor',
  'armor': 'shield',
  'range': 'targeting',
  'accuracy': 'targeting',
  'critical': 'targeting'
};

function ShipData(game, data) {
  engine.Class.mixin(data, this);

  this.game = game;

  this.config = {
    binding: ShipData.STAT_SYSTEM_BINDING,
    sort: ShipData.SYSTEM_SORT_ORDER,
    units: ShipData.STAT_UNITS,
    ship: game.cache.getJSON('ship-configuration', false)[data.chasis],
    enhancement: this.game.cache.getJSON('enhancement-configuration'),
    systems: [
      { name: 'hull', stats: ['durability', 'health', 'heal'], enhancements: [] },
      { name: 'reactor', stats: ['energy', 'recharge'], enhancements: [] },
      { name: 'pilot', stats: ['evasion'], enhancements: [] },
      { name: 'engine', stats: ['speed'], enhancements: [] },
      { name: 'shield', stats: ['armor'], enhancements: [] },
      { name: 'targeting', stats: ['range', 'accuracy', 'critical'], enhancements: [] }
    ]
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
