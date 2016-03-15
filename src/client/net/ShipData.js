
var engine = require('engine')
    EventEmitter = require('eventemitter3');

ShipData.SYSTEM_SORT_ORDER = ['hull', 'reactor', 'pilot', 'engine', 'shield', 'targeting', 'battery', 'sensor', 'cloak'];

ShipData.STAT_UNITS = {
  'durability': 'hp',
  'health':     'hp',
  'heal':       '%',
  'capacity':   'm',
  'speed':      'm',
  'evasion':    '%',
  'energy':     'gj',
  'recharge':   'gj',
  'armor':      'hp',
  'range':      'm',
  'accuracy':   '%',
  'critical':   '%'
};

ShipData.STAT_SYSTEM_BINDING = {
  'durability': 'hull',
  'capacity':   'hull',
  'health':     'hull',
  'heal':       'hull',
  'critical':   'hull',
  'speed':      'engine',
  'evasion':    'pilot',
  'energy':     'reactor',
  'recharge':   'battery',
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
      { name: 'hull', stats: ['durability', 'capacity', 'health', 'heal', 'critical'], enhancements: [] },
      { name: 'reactor', stats: ['energy'], enhancements: [] },
      { name: 'pilot', stats: ['evasion'], enhancements: [] },
      { name: 'engine', stats: ['speed'], enhancements: [] },
      { name: 'shield', stats: ['armor'], enhancements: [] },
      { name: 'targeting', stats: ['accuracy'], enhancements: [] },
      { name: 'battery', stats: ['recharge'] },
      { name: 'sensor', stats: ['range'] }
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
