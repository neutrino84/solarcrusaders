
var client = require('client'),
    uuid = require('uuid'),
    db = require('../database'),
    schema = db.schema,
    Faction = require('./Faction');

var Ship = schema.define('ship', {
  uuid:       { type: schema.UUID, default: uuid.v4 },
  name:       { type: schema.String },
  chassis:    { type: schema.String },
  class:      { type: schema.String },
  race:       { type: schema.String },
  created:    { type: schema.Date, default: Date.now },
  kills:      { type: schema.Integer, default: 0 },
  disables:   { type: schema.Integer, default: 0 },
  assists:    { type: schema.Integer, default: 0 },
  x:          { type: schema.Double, default: 2048.0 },
  y:          { type: schema.Double, default: 2048.0 },
  throttle:   { type: schema.Double, default: 1.0 },
  rotation:   { type: schema.Double, default: 0.0 },
  health:     { type: schema.Double },
  heal:       { type: schema.Double },
  energy:     { type: schema.Double },
  recharge:   { type: schema.Double },
  armor:      { type: schema.Double },
  accuracy:   { type: schema.Double },
  evasion:    { type: schema.Double },
  durability: { type: schema.Double },
  speed:      { type: schema.Double },
  range:      { type: schema.Double },
  critical:   { type: schema.Double }
});

Ship.NAMES = [
  'ubaidian-x01', 'ubaidian-x02', 'ubaidian-x03', 'ubaidian-x04',
  'hederaa-x01',
  'mechan-x01', 'mechan-x02', 'mechan-x03',
  'general-x01', 'general-x02'
];

Ship.CLASSES = [
  'mining',           // 1 light socket
  'frigate',          // 1 light socket
  'transport',        // 1 light socket
  'corvette',         // 1 light socket
  'stealth',          // 1 light socket
  'cruiser',          // 2 light socket
  'destroyer',        // 2 light socket, 1 heavy socket
  'battledestroyer',  // 2 heavy socket, 1 light socket
  'battleship',       // 2 light socket, 2 heavy socket
  'battlecarrier'     // 4 heavy socket
];

Ship.validatesLengthOf('name', { min: 2, max: 64 });

Ship.validatesInclusionOf('chassis', { in: Ship.NAMES });
Ship.validatesInclusionOf('class', { in: Ship.CLASSES });
Ship.validatesInclusionOf('race', { in: Faction.RACES });

Ship.validatesNumericalityOf('x');
Ship.validatesNumericalityOf('y');
Ship.validatesNumericalityOf('throttle');
Ship.validatesNumericalityOf('rotation');
Ship.validatesNumericalityOf('health');
Ship.validatesNumericalityOf('heal');
Ship.validatesNumericalityOf('energy');
Ship.validatesNumericalityOf('recharge');
Ship.validatesNumericalityOf('armor');
Ship.validatesNumericalityOf('accuracy');
Ship.validatesNumericalityOf('evasion');
Ship.validatesNumericalityOf('durability');
Ship.validatesNumericalityOf('speed');
Ship.validatesNumericalityOf('critical');

Ship.afterInitialize = function() {
  // load default values
  // from ship configuration
  var config, stats;
  if(this.chassis && this.isNewRecord()) {
    config = client.ShipConfiguration[this.chassis],
    stats = config.stats;
    
    if(!this.throttle) { this.throttle = 1.0; }
    if(!this.race) { this.race = config.race; }
    if(!this.class) { this.class = config.class; }
    if(!this.health) { this.health = stats.health; }
    if(!this.heal) { this.heal = stats.heal; }
    if(!this.energy) { this.energy = stats.energy; }
    if(!this.recharge) { this.recharge = stats.recharge; }
    if(!this.armor) { this.armor = stats.armor; }
    if(!this.accuracy) { this.accuracy = stats.accuracy; }
    if(!this.evasion) { this.evasion = stats.evasion; }
    if(!this.durability) { this.durability = stats.durability; }
    if(!this.speed) { this.speed = stats.speed; }
    if(!this.range) { this.range = stats.range; }
    if(!this.critical) { this.critical = stats.critical; }
  }
};

module.exports = Ship;
