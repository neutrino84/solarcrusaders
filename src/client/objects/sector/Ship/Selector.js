
var engine = require('engine');

function Selector(ship) {
  this.ship = ship;
  this.game = ship.game;
  this.manager = ship.manager;
  this.data = ship.data;
  this.color = null;
  this.alpha = null;
};

Selector.prototype.constructor = Selector;

Selector.prototype.create = function() {
  var ship = this.ship,
      radius = ship.data.size,
      halfWidth = ship.width/2,
      halfHeight = ship.height/2,
      color, alpha, thickness, fill;

  // configure
  switch(ship.data.ai) {
    case 'basic':
      color = 0xcccc33;
      alpha = 0.0;
      thickness = 8.0;
      fill = 0.0;
      break;
    case 'pirate':
      color = 0xcc3333;
      alpha = 0.6;
      thickness = 4.0;
      fill = 0.0;
      break;
    case 'squadron':
      color = 0x0066ff;
      alpha = 0.8;
      thickness = 8.0;
      fill = 0.2;
      break;
    default:
      color = 0x0066ff;
      alpha = 0.8;
      thickness = 8.0;
      fill = 0.2;
      break;
  }

  this.color = color;
  this.alpha  = alpha;

  // create hit area
  this.hit = new engine.Circle(halfWidth, halfHeight, radius);
  
  // create selection
  this.graphics = new engine.Graphics();
  this.graphics.lineStyle(thickness, color, 1.0);
  this.graphics.beginFill(color, fill);
  this.graphics.drawCircle(this.hit.x, this.hit.y, this.hit.radius * 1.34);
  this.graphics.endFill();
  this.graphics.pivot.set(halfWidth, halfHeight);
  this.graphics.position.set(halfWidth, halfHeight);
  this.graphics.blendMode = engine.BlendMode.ADD;
  this.graphics.alpha = alpha;

  // add selector
  this.ship.addChildAt(this.graphics, 0);
};

Selector.prototype.enable = function() {
  this.graphics.visible = true;
};

Selector.prototype.disable = function() {
  this.graphics.visible = false;
};

Selector.prototype.warn = function() {
  // reset
  this.graphics.alpha = 0.0;

  // animation
  if(!this.tween || this.tween && !this.tween.isRunning) {
    this.tween = this.game.tweens.create(this.graphics);
    this.tween.to({ alpha: 0.2 }, 250, engine.Easing.Quadratic.Out, false, 0, 2, true);
    this.tween.start();
  }
};

Selector.prototype.update = function() {

};

Selector.prototype.destroy = function() {
  this.ship = this.game = this.manager =
    this.data = undefined;
};

module.exports = Selector;
