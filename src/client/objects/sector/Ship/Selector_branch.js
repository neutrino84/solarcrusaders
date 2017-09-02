
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

  // create detector area
  this.detectorCircle = new engine.Circle(halfWidth, halfHeight, 3500);
  
  // create selection
  this.graphics = new engine.Graphics();
  this.graphics.lineStyle(size, color, 1.0);
  this.graphics.drawCircle(this.hit.x, this.hit.y, this.hit.radius);
  this.graphics.pivot.set(halfWidth, halfHeight);
  this.graphics.position.set(halfWidth + (size/2), halfHeight + (size/2));
  this.graphics.blendMode = engine.BlendMode.ADD;
  // this.graphics.alpha = this.alpha;
  this.graphics.alpha = 0;

  // create detector
  this.detector = new engine.Graphics();
  this.detector.lineStyle(size, 0xffff00, 1.0);
  this.detector.drawCircle(this.detectorCircle.x, this.detectorCircle.y, this.detectorCircle.radius);
  this.detector.pivot.set(halfWidth, halfHeight);
  this.detector.position.set(halfWidth + (size/2), halfHeight + (size/2));
  this.detector.blendMode = engine.BlendMode.ADD;
  // this.detector.alpha = this.alpha;
  this.detector.alpha = 0;


  //create reticle
  this.reticle = new engine.Graphics();
  this.reticleRed = new engine.Graphics(); 
  // this.reticle.lineStyle(size, 0xcc1111, 1.0);
  this.reticle.lineStyle(size, 0xffff00, 1.0);
  this.reticleRed.lineStyle(size, 0xcc1111, 1.0);
  // ship.isPlayer ? this.reticle.drawRect(this.hit.x, this.hit.y, this.hit.radius*2, this.hit.radius*2) : this.reticle.drawRect(this.hit.x, this.hit.y, this.hit.radius*1.65, this.hit.radius*1.65);

  //lower number pushes bot left corner away, higher number pulls it in

  switch(this.ship.data.chassis) {
    case 'scavengers-x01':
 
      // this.reticleRed.drawRect(this.hit.x, this.hit.y, this.hit.radius*2.1, this.hit.radius*2.1);
      // this.reticleRed.position.set(-ship.width/1.6, -ship.height/1.6);

      // this.reticleRed.drawRect(this.hit.x, this.hit.y, this.hit.radius*2.1, this.hit.radius*2.1);
      // this.reticleRed.position.set(-ship.width/1.6, -ship.height/1.6);

      this.reticle.drawRect(this.hit.x, this.hit.y, this.hit.radius*2.8, this.hit.radius*2.8);
      this.reticle.position.set(-128, -125)

      this.reticleRed.drawRect(this.hit.x, this.hit.y, this.hit.radius*2.8, this.hit.radius*2.8);
      this.reticleRed.position.set(-ship.width/1.2, -ship.height/1.2);

      this.reticleRed.pivot.set((-84), (208));
      this.reticleRed.rotation = 0.785398 

      break
    case 'scavengers-x02':
      // this.reticle.drawRect(this.hit.x, this.hit.y, this.hit.radius*2.8, this.hit.radius*2.8);
      // this.reticleRed.drawRect(this.hit.x, this.hit.y, this.hit.radius*2.1, this.hit.radius*2.1);
      // this.reticle.position.set(-ship.width/1.2, -ship.height/1.2)
      // this.reticleRed.position.set(-ship.width/1.6, -ship.height/1.6);
      // this.reticleRed.pivot.set((-ship.width/1.6)/2, (-ship.height/1.6)/2);

      // this.reticleRed.pivot.set((-84), (208));

      // this.reticleRed.rotation = 0.785398

      this.reticle.drawRect(this.hit.x, this.hit.y, this.hit.radius*2.8, this.hit.radius*2.8);
      this.reticle.position.set(-139, -136)

      this.reticleRed.drawRect(this.hit.x, this.hit.y, this.hit.radius*2.8, this.hit.radius*2.8);
      this.reticleRed.position.set(-ship.width/1.2, -ship.height/1.2);

      this.reticleRed.pivot.set((-71), (208));
      this.reticleRed.rotation = 0.785398 
      break
    case 'scavengers-x03c':
      //more shit
      this.reticle.drawRect(this.hit.x, this.hit.y, this.hit.radius*4.5, this.hit.radius*4.5)
      this.reticleRed.drawRect(this.hit.x, this.hit.y, this.hit.radius*4, this.hit.radius*4)
      this.reticle.position.set(-ship.width/1.4, -ship.height/1.4)
      this.reticle.pivot.set(0, 19)
      this.reticleRed.position.set(-ship.width/1.6, -ship.width/1.6);

      this.reticleRed.pivot.set((-158), (429));
      this.reticleRed.rotation = 0.785398 
      //xxx
      break
    case 'scavengers-x04d':
      this.reticle.drawRect(this.hit.x, this.hit.y, this.hit.radius*3.05, this.hit.radius*3.05)
      this.reticleRed.drawRect(this.hit.x, this.hit.y, this.hit.radius*2.7, this.hit.radius*2.7)
      // this.reticle.position.set(-ship.width/1.1, -ship.height/1.1)
      this.reticle.position.set(-438.5454545454545, -454.5454545454545)
      // this.reticleRed.position.set(-ship.width/1.23, -ship.height/1.23);
      this.reticleRed.position.set(-385.5040650406504, -406.5040650406504);
      // -385.5040650406504 -406.5040650406504
      this.reticleRed.pivot.set((-268), (662));
      this.reticleRed.rotation = 0.785398 

      break
    case 'pirate-x01':
      this.reticle.drawRect(this.hit.x, this.hit.y, this.hit.radius*2.8, this.hit.radius*2.8);
      // this.reticle.rotation = 5.05;
      this.reticleRed.drawRect(this.hit.x, this.hit.y, this.hit.radius*2.1, this.hit.radius*2.1);
      this.reticle.position.set(-ship.width/0.95, -ship.height/0.95); 
      this.reticleRed.position.set(-ship.width/1.3, -ship.height/1.3);
      break
    case 'pirate-x02':
      this.reticle.drawRect(this.hit.x, this.hit.y, this.hit.radius*2.8, this.hit.radius*2.8);
      // this.reticle.rotation = 1
      // this.reticle.pivot = new PIXI.Point(250, 250);
      this.reticleRed.drawRect(this.hit.x, this.hit.y, this.hit.radius*2.1, this.hit.radius*2.1);
      this.reticle.position.set(-ship.width/0.95, -ship.height/0.95); 
      this.reticleRed.position.set(-ship.width/1.25, -ship.height/1.25);
      break
    case 'pirate-x03b':
      this.reticle.drawRect(this.hit.x, this.hit.y, this.hit.radius*3.4, this.hit.radius*3.4)
      // this.reticle.rotation = 15.05;
      this.reticleRed.drawRect(this.hit.x, this.hit.y, this.hit.radius*2.7, this.hit.radius*2.7)
      this.reticle.position.set(-ship.width/1.24, -ship.height/1.24);
      this.reticleRed.position.set(-ship.width/1.54, -ship.height/1.54);
      break
    case 'squad-shield_2':
      // create shield area
      this.shieldBlueCircle = new engine.Circle(halfWidth, halfHeight, 900);
      
      // create detector
      this.shieldBlue = new engine.Graphics(); 
      this.shieldBlue.lineStyle(size, 0x0000ef, 1.5);
      this.shieldBlue.drawCircle(this.shieldBlueCircle.x, this.shieldBlueCircle.y, this.shieldBlueCircle.radius);
      this.shieldBlue.pivot.set(halfWidth, halfHeight);
      this.shieldBlue.position.set(halfWidth + (size/2), halfHeight + (size/2));
      this.shieldBlue.blendMode = engine.BlendMode.ADD;
      // this.shieldBlue.alpha = this.alpha;
      this.shieldBlue.alpha = 0;

      this.ship.addChildAt(this.shieldBlue, 0);
      break

    // case 'some chassis':
    //   //more shit
    default:
      break;
  }
  if(ship.isPlayer){
    this.reticle.drawRect(0, 0, this.hit.radius*2, this.hit.radius*2)
    // this.reticle.position.set(-ship.width/1.85, -ship.height/1.85)
    this.reticle.position.set(ship.height/2, ship.width/2)
    // this.reticle.pivot.set(this.ship.width/2, this.ship.height/2);
    this.reticle.pivot.set(this.ship.width/2, this.ship.height/2);
    // this.reticle.rotation = 0.785398 
    //^ 45 degrees in radians
    // console.log(this.reticle)
  }

  // ship.isPlayer ? this.reticle.position.set(-ship.width/1.85, -ship.height/1.85) : this.reticle.position.set(-ship.width/1.6, -ship.height/1.6);
  // : this.reticle.position.set(-ship.width/1.5, -ship.height/1.5);
  this.reticle.alpha = 0;
  this.reticleRed.alpha = 0;
  // this.reticleRed.pivot.set(-this.ship.width, -this.ship.height)
  // this.reticleRed.rotation = 0.785398 

  // add selector
  this.ship.addChildAt(this.graphics, 0);
  this.ship.addChildAt(this.detector, 0);
  this.ship.addChildAt(this.reticle, 0);
  this.ship.addChildAt(this.reticleRed, 0);
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

Selector.prototype.detectorHighlight = function() {
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

Selector.prototype.hostileEngaged = function() {
  var dbl = 0.785398*2;
  if(!this.reticleRedAnimating || (this.reticleRedAnimating && !this.reticleRedAnimating.isRunning)) {
    this.reticleRedAnimating = this.game.tweens.create(this.reticleRed);
    this.reticleRedAnimating.to({ alpha: 1.75 }, 500);
    // console.log(this.reticleRedAnimating)
    // this.reticleRedAnimating.target.pivot.set(-this.ship.width/2, -this.ship.height/2);
    // this.reticleRedAnimating.to({ rotation: dbl }, 500);
    this.reticleRedAnimating.loop(true)
    this.reticleRedAnimating.yoyo(true, 500);
    this.reticleRedAnimating.start();
    this.highlightAnimating && this.highlightAnimating.stop();
  }

  // this.reticleRedAnimating = this.game.tweens.create(this.reticle);
  // this.reticleRedAnimating.to({ alpha: 0.5 }, 500);
  // this.reticleRedAnimating.loop(true)
  // this.reticleRedAnimating.yoyo(true, 1000);
  // this.reticleRedAnimating.start();


  // this.reticleRed.pivot.set(this.reticle.pivot.x,this.reticle.pivot.y+1)
  // if(this.ship.data.chassis === 'scavengers-x02'){
  //   console.log(this.reticle.rotation, this.reticle.pivot.x, this.reticle.pivot.y)
  // }
};

Selector.prototype.hostileHighlightStop = function() {
    // console.log('in hostile highlight stop')
    this.reticleAnimating && this.reticleAnimating.stop();
    this.reticle.alpha = 0;
};

Selector.prototype.hostileEngagedStop = function() {
    this.reticleRedAnimating && this.reticleRedAnimating.stop();
    this.reticleRed.alpha = 0;
};

Selector.prototype.shieldBlueStop = function() {
    if(this.shieldBlue){
      this.shieldBlue.alpha = 0;
    }
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
