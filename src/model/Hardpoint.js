
var uuid = require('uuid'),
    db = require('../database'),
    schema = db.schema;

var Hardpoint = schema.define('hardpoint', {
  uuid:        { type: schema.UUID, default: uuid.v4 },
  name:        { type: schema.String, default: 'turret-a' },
  type:        { type: schema.String, default: 'laser' },
  created:     { type: schema.Date, default: Date.now },
  index:       { type: schema.Integer },
  damage:      { type: schema.Double, default: 2 },
  durability:  { type: schema.Double, default: 1000 }
});

Hardpoint.TYPES = ['mining', 'laser', 'rocket', 'bomb', 'ion', 'plasma', 'flak'];

Hardpoint.validatesInclusionOf('type', { in: Hardpoint.TYPES });

Hardpoint.validatesNumericalityOf('damage');
Hardpoint.validatesNumericalityOf('durability');
Hardpoint.validatesNumericalityOf('index', { int: true });

Hardpoint.afterInitialize = function() {
  // TODO: load stats from item database
};

module.exports = Hardpoint;
