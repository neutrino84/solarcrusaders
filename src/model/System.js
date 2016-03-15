
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
  health:      { type: schema.Double, default: 100.0 },
  heal:        { type: schema.Double, default: 0.0 },
  mass:        { type: schema.Double, default: 50.0 },
  failure:     { type: schema.Double, default: 0.05 },
  durability:  { type: schema.Double, default: 1000.0 },
  stats:       { type: schema.JSON }
});

System.TYPES = ['hull', 'reactor', 'pilot', 'engine', 'shield', 'targeting', 'repair', 'teleport', 'sensor', 'cloak'];
System.ENHANCEMENTS = ['overload', 'shield', 'piercing', 'booster'];

System.validatesPresenceOf('stats');

System.validatesInclusionOf('type', { in: System.TYPES });
System.validatesInclusionOf('enhancement', { in: System.ENHANCEMENTS, allowNull: true });

System.validatesNumericalityOf('modifier');
System.validatesNumericalityOf('health');
System.validatesNumericalityOf('heal');
System.validatesNumericalityOf('mass');
System.validatesNumericalityOf('durability');

module.exports = System;
