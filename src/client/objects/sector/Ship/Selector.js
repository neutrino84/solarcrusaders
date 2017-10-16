
var engine = require('engine');

function Selector(ship) {
  this.ship = ship;
  this.game = ship.game;
  this.manager = ship.manager;
  this.data = ship.data;
};

Selector.prototype.constructor = Selector;

Selector.prototype.create = function() {
  var ship = this.ship,
      radius = ship.data.size,
      halfWidth = ship.width/2,
      halfHeight = ship.height/2,
      color = ship.data.ai && ship.data.ai === 'pirate' ? 0xcc3333 : 0x0066ff;

  // add selector highlight
  this.alpha = ship.isPlayer ? 0.6 : 0.4;

  // create hit area
  this.hit = new engine.Circle(halfWidth, halfHeight, radius);
  
  // create selection
  this.graphics = new engine.Graphics();
  this.graphics.lineStyle(8.0, color, 1.0);
  this.graphics.drawCircle(this.hit.x, this.hit.y, this.hit.radius * 1.5);
  this.graphics.pivot.set(halfWidth, halfHeight);
  this.graphics.position.set(halfWidth, halfHeight);
  this.graphics.blendMode = engine.BlendMode.ADD;
  this.graphics.alpha = this.alpha;

  // add selector
  this.ship.addChildAt(this.graphics, 0);
};

Selector.prototype.disable = function() {
  this.graphics.visible = false;
};

Selector.prototype.enable = function() {
  this.graphics.visible = true;
};

Selector.prototype.update = function() {

};

Selector.prototype.destroy = function() {
  this.ship = this.game = this.manager =
    this.data = undefined;
};

module.exports = Selector;
