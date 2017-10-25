
var uuid = require('uuid'),
    db = require('../database'),
    schema = db.schema;

var Hardpoint = schema.define('hardpoint', {
  uuid:        { type: schema.UUID, default: uuid.v4 },
  name:        { type: schema.String },
  texture:     { type: schema.String },
  type:        { type: schema.String },
  sprite:      { type: schema.String },
  cargo:       { type: schema.String },
  slot:        { type: schema.Integer },
  spawn:       { type: schema.Integer, default: 1 },
  created:     { type: schema.Date, default: Date.now },
  damage:      { type: schema.Double, default: 1.0 },
  range:       { type: schema.Double, default: 1024.0 },
  projection:  { type: schema.Double, default: 0.2 },
  delay:       { type: schema.Double, default: 50.0 },
  spread:      { type: schema.Double, default: 32.0 },
  length:      { type: schema.Double, default: 50.0 },
  durability:  { type: schema.Double, default: 1000.0 }
});

Hardpoint.TYPES = ['energy', 'projectile', 'pulse'];

Hardpoint.validatesPresenceOf('name');
Hardpoint.validatesPresenceOf('type');
Hardpoint.validatesPresenceOf('sprite');
Hardpoint.validatesPresenceOf('cargo');
Hardpoint.validatesPresenceOf('texture');

Hardpoint.validatesInclusionOf('type', { in: Hardpoint.TYPES });

Hardpoint.validatesNumericalityOf('damage');
Hardpoint.validatesNumericalityOf('range');
Hardpoint.validatesNumericalityOf('projection');
Hardpoint.validatesNumericalityOf('delay');
Hardpoint.validatesNumericalityOf('spread');
Hardpoint.validatesNumericalityOf('length');
Hardpoint.validatesNumericalityOf('durability');

Hardpoint.validatesNumericalityOf('slot', { int: true });
Hardpoint.validatesNumericalityOf('spawn', { int: true });

module.exports = Hardpoint;
