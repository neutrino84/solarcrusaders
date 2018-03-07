var pixi = require('pixi'),
    engine = require('engine'),
    OutlineFilter = require('../../../fx/filters/OutlineFilter');

function MarkerSelector(object) {
  this.parent = object; 
  this.game = parent.game;
  this.manager = parent.manager;
  this.data = parent.data;
};

MarkerSelector.prototype.constructor = MarkerSelector;

MarkerSelector.prototype.create = function() {
   var halfWidth = this.parent.width/2,
       halfHeight = this.parent.height/2;
       // console.log(halfHeight, halfWidth, this.parent)
  // create yellow area

  // create yellow
  this.yellow = new engine.Graphics();
  this.yellowCircle = new engine.Circle(halfWidth, halfHeight, 200);
  this.yellow.lineStyle(1, 0xffff00, 1.0);
  this.yellow.drawCircle(this.yellowCircle.x , this.yellowCircle.y, this.yellowCircle.radius);
  this.yellow.blendMode = engine.BlendMode.ADD;
  this.yellow.alpha = 0;

  // create yegreenllow
  this.greenCircle = new engine.Circle(halfWidth, halfHeight, 200);
  this.green = new engine.Graphics();
  this.green.lineStyle(1, 0x00ff00, 1.0);
  this.green.drawCircle(this.greenCircle.x , this.greenCircle.y, this.greenCircle.radius);
  this.green.blendMode = engine.BlendMode.ADD;
  this.green.alpha = 0;

  this.parent.addChildAt(this.yellow, 0);
  this.parent.addChildAt(this.green, 0);
};

MarkerSelector.prototype.reset = function() {
  this.outline.color = 0x6699FF;
};

MarkerSelector.prototype.damage = function() {
  this.outline.color = 0xFF6666;
};

MarkerSelector.prototype.fadeOut = function() {
  this.outline.color = 0x6699FF;
};

MarkerSelector.prototype.selected = function(){
  //code for being targetted by player ship
};

MarkerSelector.prototype.update = function() {
  // this.reticle.rotation += 0.01;
};

MarkerSelector.prototype.destroyed = function() {

};

MarkerSelector.prototype.destroy = function() {
  this.ship = this.game = this.manager =
    this.data = undefined;
};

module.exports = MarkerSelector;

