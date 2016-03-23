
var uuid = require('uuid'),
    db = require('../database'),
    schema = db.schema;

var Hardpoint = schema.define('hardpoint', {
  uuid:        { type: schema.UUID, default: uuid.v4 },
  name:        { type: schema.String },
  type:        { type: schema.String, default: 'laser' },
  sprite:      { type: schema.String, default: 'turret-a' },
  cargo:       { type: schema.String, default: 'item-laser-a' },
  enhancement: { type: schema.String },
  created:     { type: schema.Date, default: Date.now },
  slot:        { type: schema.Integer },
  damage:      { type: schema.Double, default: 2.0 },
  durability:  { type: schema.Double, default: 1000.0 }
});

Hardpoint.ENHANCEMENTS = [];
Hardpoint.TYPES = ['mining', 'laser', 'rocket', 'bomb', 'ion', 'plasma', 'flak'];

Hardpoint.validatesPresenceOf('name');
Hardpoint.validatesPresenceOf('type');
Hardpoint.validatesPresenceOf('sprite');
Hardpoint.validatesPresenceOf('cargo');

Hardpoint.validatesInclusionOf('type', { in: Hardpoint.TYPES });
Hardpoint.validatesInclusionOf('enhancement', { in: Hardpoint.ENHANCEMENTS, allowNull: true });

Hardpoint.validatesNumericalityOf('damage');
Hardpoint.validatesNumericalityOf('durability');
Hardpoint.validatesNumericalityOf('slot', { int: true });

module.exports = Hardpoint;
