
var engine = require('engine');

function Selector(ship) {
  this.ship = ship;
  this.game = ship.game;
  this.manager = ship.manager;
  this.details = ship.details;
};

Selector.prototype.constructor = Selector;

Selector.prototype.create = function() {
  var ship = this.ship,
      size = ship.isPlayer ? 10 : 6,
      radius = ship.details.size,
      halfWidth = ship.width/2,
      halfHeight = ship.height/2,
      color = ship.details.ai && ship.details.ai === 'pirate' ? 0xcc3333 : 0x3366cc;

  // add selector highlight
  this.alpha = ship.isPlayer ? 0.6 : 0.2;

  // create hit area
  this.hit = new engine.Circle(halfWidth, halfHeight, radius);
  
  // create selection
  this.graphics = new engine.Graphics();
  this.graphics.lineStyle(size, color, 1.0);
  this.graphics.drawCircle(this.hit.x, this.hit.y, this.hit.radius);
  this.graphics.pivot.set(halfWidth, halfHeight);
  this.graphics.position.set(halfWidth + (size/2), halfHeight + (size/2));
  this.graphics.blendMode = engine.BlendMode.ADD;
  this.graphics.alpha = this.alpha;

  // add selector
  this.ship.addChildAt(this.graphics, 0);
}

Selector.prototype.highlight = function() {
  if(!this.animating || (this.animating && !this.animating.isRunning)) {
    this.animating = this.game.tweens.create(this.graphics);
    this.animating.to({ alpha: 1.0 }, 250);
    this.animating.on('complete', function() {
      this.graphics.alpha = this.alpha;
    }, this);
    this.animating.yoyo(true, 8000);
    this.animating.start();
  }
};

Selector.prototype.disable = function() {
  this.graphics.visible = false;
};

Selector.prototype.enable = function() {
  this.graphics.visible = true;
};

Selector.prototype.update = function() {

};

Selector.prototype.destroyed = function() {

};

Selector.prototype.destroy = function() {
  this.ship = this.game = this.manager =
    this.details = undefined;
};

module.exports = Selector;
