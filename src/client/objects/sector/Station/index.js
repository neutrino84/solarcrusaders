
var engine = require('engine');

function Station(manager, key) {
  engine.Sprite.call(this, manager.game, key);

  this.name = key;
  this.target = null;
  this.targeted = [];

  this.manager = manager;
  this.game = manager.game;

  this.rotation = 0.0;
  this.position = new engine.Point(0, 0);

  // activate culling
  this.autoCull = true;
  this.checkWorldBounds = true;

  this._selected = false;
};

Station.prototype = Object.create(engine.Sprite.prototype);
Station.prototype.constructor = Station;

Station.prototype.boot = function() {

};

Station.prototype.data = function() {
  
};

Station.prototype.update = function() {
  engine.Sprite.prototype.update.call(this);

  this.rotation += 0.00002 * this.game.clock.elapsed;
};

Station.prototype.destroy = function() {
  this.manager = this.game = this.target =
  this.targeted = undefined;

  engine.Sprite.prototype.destroy.call(this);
};

Object.defineProperty(Station.prototype, 'selected', {
  get: function() {
    return this._selected;
  }
});

module.exports = Station;
