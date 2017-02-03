
var client = require('client'),
    Utils = require('../../utils');

function System(type, subtype) {
  this.type = type;
  this.subtype = subtype || 'basic';

  this.config = client.ItemConfiguration['system'][type][this.subtype];
};

System.prototype.constructor = System;

System.prototype.toObject = function() {
  var system = Utils.extend({}, this.config);
      system.stats = {
        durability: this.config.durability
      };
  return system;
};

module.exports = System;
