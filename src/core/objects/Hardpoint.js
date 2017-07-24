
var client = require('client'),
    Utils = require('../../utils');

function Hardpoint(ship, type, subtype, slot) {
  this.ship = ship;
  this.game = ship.game;
  this.slot = slot;
  this.type = type;
  this.subtype = subtype || 'basic';

  this.data = client.ItemConfiguration['hardpoint'][this.type][this.subtype];
};

Hardpoint.prototype.constructor = Hardpoint;

Hardpoint.prototype.toObject = function() {
  return Utils.extend({ slot: this.slot }, this.data);
};

module.exports = Hardpoint;
