
var uuid = require('uuid'),
    db = require('../database'),
    schema = db.schema;

var System = schema.define('system', {
  uuid:        { type: schema.UUID, default: uuid.v4 },
  name:        { type: schema.String },
  type:        { type: schema.String },
  enhancement: { type: schema.String },
  failure:     { type: schema.Double, default: 0.0 },
  modifier:    { type: schema.Double, default: 1.0 },
  mass:        { type: schema.Double, default: 50.0 },
  durability:  { type: schema.Double, default: 1000.0 },
  created:     { type: schema.Date, default: Date.now },
  stats:       { type: schema.JSON }
});

System.TYPES = ['reactor', 'pilot', 'engine', 'shield', 'targeting', 'repair', 'teleport', 'scanner', 'cloak'];
System.ENHANCEMENTS = ['heal', 'shield', 'booster'];

System.validatesPresenceOf('name');
System.validatesPresenceOf('stats');

System.validatesInclusionOf('type', { in: System.TYPES });
System.validatesInclusionOf('enhancement', { in: System.ENHANCEMENTS, allowNull: true });

System.validatesNumericalityOf('modifier');
System.validatesNumericalityOf('mass');
System.validatesNumericalityOf('failure');
System.validatesNumericalityOf('durability');

module.exports = System;
