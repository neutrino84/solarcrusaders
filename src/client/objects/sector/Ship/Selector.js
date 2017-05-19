
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
  // this.graphics.alpha = this.alpha;
  this.graphics.alpha = 0;

  //create reticle
  this.reticle = new engine.Graphics();
  this.reticleOuter = new engine.Graphics(); 
  // this.reticle.lineStyle(size, 0xcc1111, 1.0);
  this.reticle.lineStyle(size, 0xffff00, 1.0);
  this.reticleOuter.lineStyle(size, 0xcc1111, 1.0);
  // ship.isPlayer ? this.reticle.drawRect(this.hit.x, this.hit.y, this.hit.radius*2, this.hit.radius*2) : this.reticle.drawRect(this.hit.x, this.hit.y, this.hit.radius*1.65, this.hit.radius*1.65);

    if(this.ship.data.size > 130){
      this.reticle.drawRect(this.hit.x, this.hit.y, this.hit.radius*2.2, this.hit.radius*2.2)
      this.reticleOuter.drawRect(this.hit.x, this.hit.y, this.hit.radius*2.7, this.hit.radius*2.7)
      this.reticle.position.set(-ship.width/2, -ship.height/2);
      this.reticleOuter.position.set(-ship.width/1.585, -ship.height/1.585);
    } else { 
      this.reticle.drawRect(this.hit.x, this.hit.y, this.hit.radius*1.65, this.hit.radius*1.65)
      this.reticleOuter.drawRect(this.hit.x, this.hit.y, this.hit.radius*2.1, this.hit.radius*2.1)
      this.reticle.position.set(-ship.width/1.6, -ship.height/1.6) 
      this.reticleOuter.position.set(-ship.width/1.3, -ship.height/1.3);
    };
    if(this.ship.data.chassis === 'scavengers-x01d' || this.ship.data.chassis === 'scavengers-x02c'){
      this.reticle.position.set(-ship.width/2, -ship.height/2)
      this.reticleOuter.position.set(-ship.width/1.6, -ship.height/1.6);
    }
    if(this.ship.data.chassis === 'scavengers-x04d'){
      this.reticle.position.set(-ship.width/1.5, -ship.height/1.5)
      this.reticleOuter.position.set(-ship.width/1.21, -ship.height/1.21);
    }
    

    if(ship.isPlayer){
      this.reticle.drawRect(this.hit.x, this.hit.y, this.hit.radius*2, this.hit.radius*2)
      this.reticle.position.set(-ship.width/1.85, -ship.height/1.85)
    }

  // ship.isPlayer ? this.reticle.position.set(-ship.width/1.85, -ship.height/1.85) : this.reticle.position.set(-ship.width/1.6, -ship.height/1.6);
  // : this.reticle.position.set(-ship.width/1.5, -ship.height/1.5);
  this.reticle.alpha = 0;
  this.reticleOuter.alpha = 0;

  // add selector
  this.ship.addChildAt(this.graphics, 0);
  this.ship.addChildAt(this.reticle, 0);
  this.ship.addChildAt(this.reticleOuter, 0);
};

Selector.prototype.highlight = function(type) {
  if(!this.highlightAnimating || (this.highlightAnimating && !this.highlightAnimating.isRunning)){
    if(this.reticleAnimating && this.reticleAnimating.isRunning){return}
    this.highlightAnimating = this.game.tweens.create(this.graphics);
    this.highlightAnimating.to({ alpha: 0.5 }, 250);
    this.highlightAnimating.on('complete', function() {
      this.graphics.alpha = this.alpha;
    }, this);
    this.highlightAnimating.yoyo(true, 9500);
    // this.highlightAnimating.start();
  }
};

Selector.prototype.hostileHighlight = function() {
  if(!this.reticleAnimating || (this.reticleAnimating && !this.reticleAnimating.isRunning)) {
    this.reticleAnimating = this.game.tweens.create(this.reticle);
    this.reticleAnimating.to({ alpha: 0.5 }, 500);
    this.reticleAnimating.loop(true)
    this.reticleAnimating.yoyo(true, 1000);
    this.reticleAnimating.start();
    this.highlightAnimating && this.highlightAnimating.stop();
  }
};

Selector.prototype.hostileEngaged = function() {
  if(!this.reticleOuterAnimating || (this.reticleOuterAnimating && !this.reticleOuterAnimating.isRunning)) {
    this.reticleOuterAnimating = this.game.tweens.create(this.reticleOuter);
    this.reticleOuterAnimating.to({ alpha: 2.0 }, 500);
    this.reticleOuterAnimating.loop(true)
    this.reticleOuterAnimating.yoyo(true, 1200);
    this.reticleOuterAnimating.start();
    this.highlightAnimating && this.highlightAnimating.stop();
  }
};

Selector.prototype.hostileHighlightStop = function() {
    this.reticleAnimating && this.reticleAnimating.stop();
    this.reticle.alpha = 0;
};
Selector.prototype.hostileEngagedStop = function() {
    this.reticleOuterAnimating && this.reticleOuterAnimating.stop();
    this.reticleOuter.alpha = 0;
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
