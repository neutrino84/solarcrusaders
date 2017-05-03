
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
  this.alpha = ship.isPlayer ? 0.6 : 0.9;

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
  this.reticle.lineStyle(size, 0xcc1111, 0.3);
  ship.isPlayer ? this.reticle.drawRect(this.hit.x, this.hit.y, this.hit.radius*2, this.hit.radius*2) : this.reticle.drawRect(this.hit.x, this.hit.y, this.hit.radius, this.hit.radius);
  ship.isPlayer ? this.reticle.position.set(-ship.width/1.85, -ship.height/1.85) : this.reticle.position.set(-ship.width/2, -ship.height/2);

  // add selector
  this.ship.addChildAt(this.graphics, 0);
  this.ship.addChildAt(this.reticle, 0);
};

Selector.prototype.highlight = function(type) {
  if(!this.highlightAnimating || (this.highlightAnimating && !this.highlightAnimating.isRunning)){
    if(this.reticleAnimating && this.reticleAnimating.isRunning){return}
    this.highlightAnimating = this.game.tweens.create(this.graphics);
    this.highlightAnimating.to({ alpha: 1.0 }, 250);
    this.highlightAnimating.on('complete', function() {
      this.graphics.alpha = this.alpha;
    }, this);
    this.highlightAnimating.yoyo(true, 9500);
    this.highlightAnimating.start();
  }
};

Selector.prototype.hostileHighlight = function() {
  console.log('hostileHIGHLIGHT')
  if(!this.reticleAnimating || (this.reticleAnimating && !this.reticleAnimating.isRunning)) {
    this.reticleAnimating = this.game.tweens.create(this.reticle);
    this.reticleAnimating.to({ alpha: 1.0 }, 250);
    this.reticleAnimating.loop(true)
    this.reticleAnimating.yoyo(true, 9500);
    this.reticleAnimating.start();
  console.log(this.reticle)
    this.highlightAnimating && this.highlightAnimating.stop();
  }
};

Selector.prototype.hostileHighlightStop = function() {
    if(this.reticleAnimating){
      this.reticleAnimating.stop();
    };
    this.reticle.alpha = 0;
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
