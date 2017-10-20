
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
      state = parent.state;

  events.repeat(20, 5, function() {
    state.flashEmitter.critical();
    state.flashEmitter.at({ center: parent });
    state.flashEmitter.explode(2);
  });
};

Damage.prototype.destroy = function() {
  this.parent = this.game = this.events =
    this.manager = undefined;
};

module.exports = Damage;
