var pixi = require('pixi'),
    engine = require('engine'),
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
      size = ship.isPlayer ? 10 : 6,
      radius = ship.data.size,
      halfWidth = ship.width/2,
      halfHeight = ship.height/2,
      color = ship.data.ai && ship.data.ai === 'pirate' ? 0xcc3333 : 0x3366cc;

  // add selector highlight
  this.alpha = ship.isPlayer ? 0.4 : 0.2;

  // create hit area
  this.hit = new engine.Circle(halfWidth, halfHeight, radius);

  // create detector area
  this.detectorCircle = new engine.Circle(halfWidth, halfHeight, 800);
  
  // create selection
  this.graphics = new engine.Graphics();
  this.graphics.lineStyle(size, color, 1.0);
  this.graphics.drawCircle(this.hit.x, this.hit.y, this.hit.radius);
  this.graphics.pivot.set(halfWidth, halfHeight);
  this.graphics.position.set(halfWidth + (size/2), halfHeight + (size/2));
  this.graphics.blendMode = engine.BlendMode.ADD;
  this.graphics.alpha = 0.0;

  //create reticle
  this.reticle = new engine.Graphics();
  this.reticle.lineStyle(10, 0x336699, 1.0);
  this.reticle.drawRect(0, 0, ship.width, ship.height);
  this.reticle.pivot.set(halfWidth, halfHeight);
  this.reticle.position.set(halfWidth + 5, halfHeight + 5);
  this.reticle.blendMode = engine.BlendMode.ADD;
  this.reticle.rotation = global.Math.PI / 4;
  this.reticle.alpha = 0.0;

  this.reticleRed = new engine.Graphics(); 
  this.reticleRed.lineStyle(1, 0xcc1111, 1.0);
  this.reticleRed.drawRect(0, 0, ship.width, ship.height);
  this.reticleRed.pivot.set(halfWidth, halfHeight);
  this.reticleRed.position.set(halfWidth + 5, halfHeight + 5);
  this.reticleRed.alpha = 0;

  // create detector
  this.detector = new engine.Graphics();
  this.detector.lineStyle(1, 0xffff00, 1.0);
  this.detector.drawCircle(this.detectorCircle.x, this.detectorCircle.y, this.detectorCircle.radius);
  this.detector.pivot.set(halfWidth, halfHeight);
  this.detector.position.set(halfWidth + (size/2), halfHeight + (size/2));
  this.detector.blendMode = engine.BlendMode.ADD;
  // this.detector.alpha = this.alpha;
  this.detector.alpha = 0;

  // add selector
  this.ship.addChildAt(this.graphics, 0);
  this.ship.addChildAt(this.reticle, 0);
  this.ship.addChildAt(this.reticleRed, 0);
  this.ship.addChildAt(this.detector, 0);

   this.outline = new OutlineFilter(1.0, 0x6699FF);
   this.outline.blendMode = engine.BlendMode.ADD;
   this.sprite = new engine.Sprite(this.game, 'texture-atlas', ship.data.chassis + '.png');
   this.sprite.filters = [this.outline];
   
   this.ship.addChild(this.sprite);
};

Selector.prototype.reset = function() {
  this.outline.color = 0x6699FF;
};

Selector.prototype.damage = function() {
  this.outline.color = 0xFF6666;
};

Selector.prototype.detectorHighlight = function() {
  console.log('select detect')
  if(!this.detectorAnimating || (this.detectorAnimating && !this.detectorAnimating.isRunning)){
    this.detectorAnimating = this.game.tweens.create(this.detector);
    this.detectorAnimating.to({ alpha: 1 }, 500);
    this.detectorAnimating.on('complete', function() {
      this.detector.alpha = 0;
    }, this);
    this.detectorAnimating.start();
  }
      this.reticle.pivot.set(this.reticle.pivot.x,this.reticle.pivot.y+1)
      if(this.ship.data.chassis === 'scavengers-x03c'){
        console.log(this.reticle.rotation, this.reticle.pivot.x, this.reticle.pivot.y)
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

Selector.prototype.hostileHighlight = function() {
  if(!this.reticleAnimating || (this.reticleAnimating && !this.reticleAnimating.isRunning)) {
    this.reticleAnimating = this.game.tweens.create(this.reticle);
    this.reticleAnimating.to({ alpha: 0.9 }, 500);
    // this.reticleAnimating.to({ rotation: 0.9 }, 500);
    this.reticleAnimating.loop(true)
    this.reticleAnimating.yoyo(true, 1500);
    this.reticleAnimating.start();
    this.highlightAnimating && this.highlightAnimating.stop();
  }
};

Selector.prototype.hostileHighlightStop = function() {
    // console.log('in hostile highlight stop')
    this.reticleAnimating && this.reticleAnimating.stop();
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
