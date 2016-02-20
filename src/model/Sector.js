
var db = require('../database'),
	schema = db.schema;

var Sector = schema.define('sector', {
  name: { type: schema.String, index: true },
  created: { type: schema.Date, default: Date.now }
});

Sector.validatesPresenceOf('name');

module.exports = Sector;
