
var client = require('client'),
    uuid = require('uuid'),
    db = require('../database'),
    Generator = require('../utils/Generator'),
    Faction = require('./Faction'),
    schema = db.schema;

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
  credits:    { type: schema.Double, default: 0.0 },
  reputation: { type: schema.Double, default: 0.0 },
  x:          { type: schema.Double, default: 2048.0 },
  y:          { type: schema.Double, default: 2048.0 },
  throttle:   { type: schema.Double, default: 1.0 },
  rotation:   { type: schema.Double, default: 0.0 },
  health:     { type: schema.Double },
  heal:       { type: schema.Double },
  capacity:   { type: schema.Double },
  size:       { type: schema.Double },
  energy:     { type: schema.Double },
  recharge:   { type: schema.Double },
  armor:      { type: schema.Double },
  evasion:    { type: schema.Double },
  durability: { type: schema.Double },
  speed:      { type: schema.Double },
  rate:       { type: schema.Double },
  critical:   { type: schema.Double }
});

Ship.CLASSES = [
  'mining',           // 1 socket
  'frigate',          // 1 socket
  'transport',        // 1 socket
  'corvette',         // 1 socket
  'stealth',          // 1 socket
  'cruiser',          // 2 socket
  'destroyer',        // 3 socket
  'battleship',       // 4 socket
  'battlecarrier'     // 4 socket
];

Ship.validatesLengthOf('name', { min: 2, max: 64 });
Ship.validatesInclusionOf('class', { in: Ship.CLASSES });
Ship.validatesInclusionOf('race', { in: Faction.RACES });

Ship.validatesNumericalityOf('x');
Ship.validatesNumericalityOf('y');
Ship.validatesNumericalityOf('throttle');
Ship.validatesNumericalityOf('rotation');
Ship.validatesNumericalityOf('health');
Ship.validatesNumericalityOf('heal');
Ship.validatesNumericalityOf('capacity');
Ship.validatesNumericalityOf('size');
Ship.validatesNumericalityOf('energy');
Ship.validatesNumericalityOf('recharge');
Ship.validatesNumericalityOf('armor');
Ship.validatesNumericalityOf('evasion');
Ship.validatesNumericalityOf('durability');
Ship.validatesNumericalityOf('speed');
Ship.validatesNumericalityOf('rate');
Ship.validatesNumericalityOf('critical');

Ship.prototype.init = function() {
  var config, stats;
  if(this.chassis && this.isNewRecord()) {
    config = client.ShipConfiguration[this.chassis],
    stats = config.stats;
    
    if(!this.name) { this.name = Generator.getName(config.race); }
    if(!this.throttle) { this.throttle = 1.0; }
    if(!this.race) { this.race = config.race; }
    if(!this.class) { this.class = config.class; }
    if(!this.health) { this.health = stats.health; }
    if(!this.heal) { this.heal = stats.heal; }
    if(!this.capacity) { this.capacity = stats.capacity; }
    if(!this.size) { this.size = stats.size; }
    if(!this.energy) { this.energy = stats.energy; }
    if(!this.recharge) { this.recharge = stats.recharge; }
    if(!this.armor) { this.armor = stats.armor; }
    if(!this.evasion) { this.evasion = stats.evasion; }
    if(!this.durability) { this.durability = stats.durability; }
    if(!this.speed) { this.speed = stats.speed; }
    if(!this.rate) { this.rate = stats.rate; }
    if(!this.critical) { this.critical = stats.critical; }
  }
};

module.exports = Ship;
