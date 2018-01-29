
var client = require('client'),
    uuid = require('uuid'),
    db = require('../database'),
    schema = db.schema,
    Faction = require('./Faction');

var Station = schema.define('station', {
  uuid:       { type: schema.UUID, default: uuid.v4 },
  created:    { type: schema.Date, default: Date.now },
  name:       { type: schema.String },
  chassis:    { type: schema.String },
  race:       { type: schema.String },
  x:          { type: schema.Double, default: 2048.0 },
  y:          { type: schema.Double, default: 2048.0 },
  rotation:   { type: schema.Double, default: 0.0 },
  spin:       { type: schema.Double, default: 0.0 },
  period:     { type: schema.Double, default: 0.0 },
  throttle:   { type: schema.Double, default: 1.0 },
  radius:     { type: schema.Double, default: 512.0 },
  health:     { type: schema.Double },
  heal:       { type: schema.Double },
  size:       { type: schema.Double },
  speed:      { type: schema.Double },
  armor:      { type: schema.Double }
});

Station.validatesLengthOf('name', { min: 2, max: 32 });
Station.validatesInclusionOf('race', { in: Faction.RACES });

Station.validatesNumericalityOf('x');
Station.validatesNumericalityOf('y');
Station.validatesNumericalityOf('rotation');
Station.validatesNumericalityOf('spin');
Station.validatesNumericalityOf('period');
Station.validatesNumericalityOf('throttle');
Station.validatesNumericalityOf('radius');
Station.validatesNumericalityOf('health');
Station.validatesNumericalityOf('heal');
Station.validatesNumericalityOf('size');
Station.validatesNumericalityOf('speed');
Station.validatesNumericalityOf('armor');

Station.prototype.init = function() {
  // var config, stats;
  if(this.chassis && this.isNewRecord()) {
    config = client.StationConfiguration[this.chassis],
    stats = config.stats;

    if(!this.race) { this.race = config.race; }
    if(!this.health) { this.health = stats.health; }
    if(!this.heal) { this.heal = stats.heal; }
    if(!this.size) { this.size = stats.size; }
    if(!this.speed) { this.speed = stats.speed; }
    if(!this.spin) { this.spin = stats.spin; }
    if(!this.armor) { this.armor = stats.armor; }
  } else if(this.isNewRecord()) {
    throw new Error('Station models must have a chassis assigned');
  }
};

module.exports = Station;
