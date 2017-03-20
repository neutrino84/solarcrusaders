
var client = require('client'),
    Utils = require('../../utils');

function Hardpoint(ship, slot, type, subtype) {
  this.ship = ship;
  this.game = ship.game;
  this.slot = slot;
  this.type = type;
  this.subtype = subtype || 'basic';

  this.data = client.ItemConfiguration['hardpoint'][this.type][this.subtype];

  this.cooling = false;
};

Hardpoint.prototype.constructor = Hardpoint;

Hardpoint.prototype.cooldown = function(runtime) {
  var rnd = this.game.rnd,
      cooldown = this.data.cooldown + runtime,
      time = rnd.realInRange(cooldown, cooldown*2);

  this.cooling = true;
  this.game.clock.events.add(time, this.cooled, this);
};

Hardpoint.prototype.cooled = function() {
  this.cooling = false;

  if(this.ship.user) {
    this.ship.user.socket.emit('ship/hardpoint/cooled', {
      slot: this.slot
    });
  }
};

Hardpoint.prototype.toObject = function() {
  return Utils.extend({ slot: this.slot }, this.data);
};

module.exports = Hardpoint;
