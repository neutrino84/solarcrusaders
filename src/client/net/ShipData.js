
var engine = require('engine')
    EventEmitter = require('eventemitter3');

ShipData.SYSTEM_SORT_ORDER = ['hull', 'reactor', 'pilot', 'engine', 'shield', 'targeting', 'sensor', 'repair', 'cloak'];

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
  'evasion':    '%',
  'accuracy':   '%',
  'critical':   '%'
};

ShipData.STAT_SYSTEM_BINDING = {
  'durability': 'hull',
  'capacity':   'hull',
  'energy':     'hull',
  'health':     'hull',
  'critical':   'hull',
  'heal':       'repair',
  'speed':      'engine',
  'evasion':    'pilot',
  'recharge':   'reactor',
  'armor':      'shield',
  'range':      'sensor',
  'accuracy':   'targeting'
};

function ShipData(game, data) {
  engine.Class.mixin(data, this);

  this.game = game;

  this.config = {
    binding: ShipData.STAT_SYSTEM_BINDING,
    sort: ShipData.SYSTEM_SORT_ORDER,
    units: ShipData.STAT_UNITS,
    ship: game.cache.getJSON('ship-configuration', false)[data.chassis],
    enhancement: this.game.cache.getJSON('item-configuration')['enhancement'],
    systems: [
      { name: 'hull', stats: ['health', 'energy', 'durability', 'capacity', 'critical'], enhancements: [] },
      { name: 'reactor', stats: ['recharge'], enhancements: [] },
      { name: 'repair', stats: ['heal'], enhancements: [] },
      { name: 'pilot', stats: ['evasion'], enhancements: [] },
      { name: 'engine', stats: ['speed'], enhancements: [] },
      { name: 'shield', stats: ['armor'], enhancements: [] },
      { name: 'targeting', stats: ['accuracy'], enhancements: [] },
      { name: 'sensor', stats: ['range'], enhancements: [] }
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
