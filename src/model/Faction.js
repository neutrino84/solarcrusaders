
var uuid = require('uuid'),
    db = require('../database'),
    schema = db.schema;

var Faction = schema.define('faction', {
  uuid:        { type: schema.UUID, default: uuid.v4 },
  name:        { type: schema.String },
  created:     { type: schema.Date, default: Date.now }
});

Faction.RACES = [
  'ubaidian',
  'hederaa',
  'seeker',
  'mechan'
];

Faction.validatesPresenceOf('name');

module.exports = Faction;
