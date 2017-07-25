
var engine = require('engine')

function Damage(parent) {
  this.parent = parent;
  this.manager = parent.manager;
  this.events = parent.events;
  this.game = parent.game;
};

Damage.prototype.constructor = Damage;

Damage.prototype.create = function() {
  //..
};

Damage.prototype.critical = function() {
  var events = this.events,
      parent = this.parent,
      manager = parent.manager;

  events.repeat(20, 5, function() {
    manager.flashEmitter.critical();
    manager.flashEmitter.at({ center: parent });
    manager.flashEmitter.explode(2);
  });
};

Damage.prototype.destroy = function() {
  this.parent = this.game = this.events =
    this.manager = undefined;
};

module.exports = Damage;
