
var engine = require('engine')

function Damage(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.events = parent.events;
};

Damage.prototype.constructor = Damage;

Damage.prototype.create = function() {
  //..
};

Damage.prototype.critical = function() {
  // var game = this.game,
  //     events = this.events,
  //     parent = this.parent;

  // events.repeat(20, 5, function() {
  //   game.emitters.flash.critical();
  //   game.emitters.flash.at({ center: parent });
  //   game.emitters.flash.explode(1);
  // });
};

Damage.prototype.destroy = function() {
  this.parent = this.game =
    this.events = undefined;
};

module.exports = Damage;
