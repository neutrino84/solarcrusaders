
var uuid = require('uuid'),
    db = require('../database'),
    schema = db.schema;

var Stripe = schema.define('stripe', {
  uuid:            { type: schema.UUID, default: uuid.v4 },
  email:           { type: schema.String, index: true, unique: true },
  stripe_id:       { type: schema.String },
  default_source:  { type: schema.String },
  name:            { type: schema.String },
  currency:        { type: schema.String },
  edition:         { type: schema.String }, 
  created:         { type: schema.Date, default: Date.now }
});

Stripe.validatesPresenceOf('stripe_id');
Stripe.validatesPresenceOf('email');

Stripe.validatesInclusionOf('edition', { in: ['lieutenant', 'commander', 'captain'] });

module.exports = Stripe;
