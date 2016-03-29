
var engine = require('engine');

function Station(manager, data) {
  engine.Sprite.call(this, manager.game, data.chassis);

  this.name = data.chassis;
  this.manager = manager;
  this.game = manager.game;

  this.data = data;

  this.period = data.index * global.Math.PI;
  this.orbit = new engine.Circle(2048/4, 2048/4, data.orbit);
  this.pivot.set(this.width/2, this.width/2);
  this.rotation = global.Math.random() * global.Math.PI;

  // activate culling
  this.autoCull = true;
  this.checkWorldBounds = true;
};

Station.prototype = Object.create(engine.Sprite.prototype);
Station.prototype.constructor = Station;

Station.prototype.boot = function() {
  this.cap = new engine.Sprite(this.game, this.data.chassis + '-cap');
  this.cap.pivot.set(this.cap.width/2, this.cap.height/2);
  this.cap.position.set(this.width/2, this.width/2);
  this.cap.rotation = global.Math.random() * global.Math.PI;
  this.addChild(this.cap);
};

Station.prototype.update = function() {
  engine.Sprite.prototype.update.call(this);

  this.orbit.circumferencePoint(this.period, false, false, this.position);
  this.period += 0.00002 * this.game.clock.elapsed;
  this.rotation -= 0.00001 * this.game.clock.elapsed;
  this.cap.rotation += 0.00008 * this.game.clock.elapsed;
};

Station.prototype.destroy = function() {
  this.manager = this.game = this.target =
    this.targeted = undefined;
  engine.Sprite.prototype.destroy.call(this);
};

module.exports = Station;
