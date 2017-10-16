
var engine = require('engine'),
    OutlineFilter = require('../../../fx/filters/OutlineFilter');

function Selector(ship) {
  this.ship = ship;
  this.game = ship.game;
  this.manager = ship.manager;
  this.data = ship.data;
};

Selector.prototype.constructor = Selector;

Selector.prototype.create = function() {
  var ship = this.ship,
      size = ship.isPlayer ? 12 : 10,
      radius = ship.data.size,
      halfWidth = ship.width/2,
      halfHeight = ship.height/2,
      color = ship.data.ai && ship.data.ai === 'pirate' ? 0xcc3333 : 0x0066ff;

  // add selector highlight
  this.alpha = ship.isPlayer ? 0.6 : 0.2;

  // create hit area
  this.hit = new engine.Circle(halfWidth, halfHeight, radius);
  
  // create selection
  this.graphics = new engine.Graphics();
  this.graphics.lineStyle(size, color, 1.0);
  this.graphics.drawCircle(this.hit.x, this.hit.y, this.hit.radius * 2);
  this.graphics.pivot.set(halfWidth, halfHeight);
  this.graphics.position.set(halfWidth, halfHeight);
  this.graphics.blendMode = engine.BlendMode.ADD;
  this.graphics.alpha = this.alpha;

  //create reticle
  // this.reticle = new engine.Graphics();
  // this.reticle.lineStyle(10, 0x336699, 1.0);
  // this.reticle.drawRect(0, 0, ship.width, ship.height);
  // this.reticle.pivot.set(halfWidth, halfHeight);
  // this.reticle.position.set(halfWidth + 5, halfHeight + 5);
  // this.reticle.blendMode = engine.BlendMode.ADD;
  // this.reticle.rotation = global.Math.PI / 4;
  // this.reticle.alpha = 0.0;

  // add selector
  this.ship.addChildAt(this.graphics, 0);
  // this.ship.addChildAt(this.reticle, 0);

  // add outline
  if(this.ship.isPlayer) {
    this.outlineFilter = new OutlineFilter(2.0, 0x0066ff);
    this.outlineFilter.blendMode = engine.BlendMode.ADD;

    this.sprite = new engine.Sprite(this.game, 'texture-atlas', ship.data.chassis + '.png');
    this.sprite.filters = [this.outlineFilter];

    this.ship.addChild(this.sprite);
  }
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
