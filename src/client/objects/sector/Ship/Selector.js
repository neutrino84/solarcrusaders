
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
      size = ship.isPlayer ? 10 : 6,
      radius = ship.data.size,
      halfWidth = ship.width/2,
      halfHeight = ship.height/2,
      color = ship.data.ai && ship.data.ai === 'pirate' ? 0xcc3333 : 0x3366cc;

  // add selector highlight
  this.alpha = ship.isPlayer ? 0.6 : 0.2;

  console.log('width is ', ship.width, 'height is ', ship.height)

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

  //create reticle
  this.reticle = new engine.Graphics();
  this.reticle.lineStyle(size, 0xcc1111, 1.0);
  ship.isPlayer ? this.reticle.drawRect(this.hit.x, this.hit.y, this.hit.radius*2, this.hit.radius*2) : this.reticle.drawRect(this.hit.x, this.hit.y, this.hit.radius, this.hit.radius);
  ship.isPlayer ? this.reticle.position.set(-ship.width/1.85, -ship.height/1.85) : this.reticle.position.set(-ship.width/2, -ship.height/2);

  // add selector
  this.ship.addChildAt(this.graphics, 0);
  // this.ship.addChildAt(this.reticle, 0);
};

Selector.prototype.highlight = function() {
  if(!this.animating || (this.animating && !this.animating.isRunning)) {
    this.animating = this.game.tweens.create(this.graphics);
    this.animating.to({ alpha: 1.0 }, 250);
    this.animating.on('complete', function() {
      this.graphics.alpha = this.alpha;
    }, this);
    this.animating.yoyo(true, 9500);
    this.animating.start();
  }
};

Selector.prototype.selected = function(){
  //code for being targetted by player ship
};

Selector.prototype.disable = function() {
  this.graphics.visible = false;
};

Selector.prototype.enable = function() {
  this.graphics.visible = true;
};

Selector.prototype.update = function() {
  // this.reticle.rotation += 0.01;
};

Selector.prototype.destroyed = function() {

};

Selector.prototype.destroy = function() {
  this.ship = this.game = this.manager =
    this.data = undefined;
};

module.exports = Selector;
