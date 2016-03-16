
var client = require('client'),
    Utils = require('../../utils');

function Hardpoint(slot, type, subtype) {
  this.slot = slot;
  this.type = type;
  this.subtype = subtype || 'alpha';

  this.config = client.ItemConfiguration['hardpoint'][type][this.subtype];
};

Hardpoint.prototype.constructor = Hardpoint;

Hardpoint.prototype.toObject = function() {
  return Utils.extend({
  	slot: this.slot
  }, this.config);
};

module.exports = Hardpoint;
