
var winston = require('winston'),
    nconf = require('nconf'),
    async = require('async'),
    stripe = require('stripe');

function Stripe(routes) {
  this.routes = routes;
  this.customers = {};
};

Stripe.prototype.init = function(next) {
  this.api = stripe(nconf.get('production') ? nconf.get('stripe:production') : nconf.get('stripe:dev'));
};

Stripe.prototype.create = function(data) {
  //.. create new stripe object
  //.. connect to stripe hoook
};

module.exports = Stripe;
