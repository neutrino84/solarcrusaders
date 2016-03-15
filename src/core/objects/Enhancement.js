
var client = require('client'),
    EventEmitter = require('eventemitter3');

function Enhancement(parent, enhancement) {
  this.parent = parent;
  this.name = enhancement;
  this.game = parent.game;
  this.activated = false;

  this.config = client.ItemConfiguration['enhancement'][enhancement];

  EventEmitter.call(this);
};

Enhancement.prototype = Object.create(EventEmitter.prototype);
Enhancement.prototype.constructor = Enhancement;

Enhancement.prototype.stat = function(name, property) {
  return this.config.stats[name][property];
};

Enhancement.prototype.start = function() {
  var clock = this.game.clock,
      active = this.active * 1000,
      cooldown = this.cooldown * 1000;
  this.activated = true;
  active && (this.activeTimer = clock.events.add(active, this._deactivated, this));
  cooldown && (this.cooldownTimer = clock.events.add(cooldown, this._cooled, this));
};

Enhancement.prototype.stop = function() {
  if(this.activated) {
    this.activeTimer && this.game.clock.events.remove(this.activeTimer);
    this.cooldownTimer && this.game.clock.events.remove(this.cooldownTimer);
  }
};

Enhancement.prototype.destroy = function() {
  this.stop();
  this.removeAllListeners();
  this.parent = this.game = this.config =
    this.activeTimer = this.cooldownTimer = undefined;
};

Enhancement.prototype._deactivated = function() {
  this.emit('deactivated', this);
};

Enhancement.prototype._cooled = function() {
  this.activated = false;
  this.emit('cooled', this);
};

Object.defineProperty(Enhancement.prototype, 'cooldown', {
  get: function() {
    return this.config.cooldown;
  }
});

Object.defineProperty(Enhancement.prototype, 'active', {
  get: function() {
    return this.config.active;
  }
});

Object.defineProperty(Enhancement.prototype, 'stats', {
  get: function() {
    return this.config.stats;
  }
});

Object.defineProperty(Enhancement.prototype, 'cost', {
  get: function() {
    return this.config.cost;
  }
});

module.exports = Enhancement;
