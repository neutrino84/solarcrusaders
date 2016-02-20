
var uuid = require('uuid'),
    db = require('../database'),
    schema = db.schema;

var Hardpoint = schema.define('hardpoint', {
  uuid:        { type: schema.UUID, default: uuid.v4 },
  name:        { type: schema.String, default: 'laser-x01' },
  type:        { type: schema.String, default: 'laser' },
  created:     { type: schema.Date, default: Date.now },
  damage:      { type: schema.Double, default: 2 },
  durability:  { type: schema.Double, default: 1000 }
});

Hardpoint.TYPES = ['mining', 'laser', 'rocket', 'bomb', 'ion', 'plasma', 'flak'];

Hardpoint.validatesInclusionOf('type', { in: Hardpoint.TYPES });

Hardpoint.validatesNumericalityOf('damage');
Hardpoint.validatesNumericalityOf('durability');

Hardpoint.afterInitialize = function() {
  // TODO: load stats from item database
};

module.exports = Hardpoint;
