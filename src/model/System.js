
var uuid = require('uuid'),
    db = require('../database'),
    schema = db.schema;

var System = schema.define('system', {
  uuid:        { type: schema.UUID, default: uuid.v4 },
  name:        { type: schema.String },
  type:        { type: schema.String },
  enhancement: { type: schema.String },
  created:     { type: schema.Date, default: Date.now },
  modifier:    { type: schema.Double, default: 1.0 },
  health:      { type: schema.Double, default: 100 },
  heal:        { type: schema.Double, default: 3 },
  energy:      { type: schema.Double, default: 0.01 },
  durability:  { type: schema.Double, default: 1000 },
  stats:       { type: schema.JSON }
});

System.TYPES = ['hull', 'reactor', 'pilot', 'engine', 'shield', 'targeting', 'teleport'];
System.ENHANCEMENTS = ['overload', 'shield', 'piercing', 'booster'];
System.ENHANCEMENTS_MAP = {
  reactor: 'overload',
  engine: 'booster',
  targeting: 'piercing',
  shield: 'shield'
};

System.validatesLengthOf('name', { min: 2, max: 64 });
System.validatesInclusionOf('type', { in: System.TYPES });
System.validatesInclusionOf('enhancement', { in: System.ENHANCEMENTS, allowNull: true });

System.validatesNumericalityOf('modifier');
System.validatesNumericalityOf('health');
System.validatesNumericalityOf('heal');
System.validatesNumericalityOf('energy');
System.validatesNumericalityOf('durability');

System.afterInitialize = function() {
  // TODO: load stats from item database
  var enhancement;
  if(this.isNewRecord()) {
    if(!this.enhancement) {
      this.enhancement = System.ENHANCEMENTS_MAP[this.type];
    }
    if(!this.stats) {
      this.stats = { health: 100 };
    }
  }
};

module.exports = System;
