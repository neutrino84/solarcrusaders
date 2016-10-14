var engine = require('engine');

function Ship(game, shipSettings, settings) {
  engine.Graphics.call(this, game);

  this.ship = shipSettings.ship;
  this.ship.direction = {x: engine.Math.getRandomInt(-1, 1), y: engine.Math.getRandomInt(-1, 1)};

  if(this.ship.direction.x == 0 && this.ship.direction.y == 0){
    this.ship.direction = {x: 1, y: engine.Math.getRandomInt(-1, 1)};
  }

  this.settings = settings;
  this.thickness = 3;

  this.lineStyle(0);
  this.beginFill(shipSettings.color, 0.9);
  this.drawCircle(0, 0, this.thickness);
  this.endFill();

  this.needUpdate = true;

  this.update();
};

Ship.prototype = Object.create(engine.Graphics.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.update = function(){
  var positionWithZoom = [this.ship.x / this.settings.zoom, this.ship.y / this.settings.zoom];
  var userWithZoom = [this.settings.user.ship.x / this.settings.zoom, this.settings.user.ship.y / this.settings.zoom];
    
  this.position.x = this.settings.size / 2 + positionWithZoom[0] - userWithZoom[0];
  this.position.y = this.settings.size / 2 + positionWithZoom[1] - userWithZoom[1];
  
  var distance = engine.Math.distance( positionWithZoom[0], positionWithZoom[1], userWithZoom[0], userWithZoom[1]);
  this.visible = distance < this.settings.size / 2;
};

Ship.prototype.test = function(){
  if(engine.Math.distance(this.ship.x, this.ship.y, this.settings.user.ship.x, this.settings.user.ship.y) / this.settings.zoom > this.settings.size / 2 - 2
      && engine.Math.getRandomInt(0, 10) > 8){
    this.ship.direction = engine.Math.reverseVector(this.ship.direction);
  }

  if(this.ship.x <= 0){
    this.ship.direction.x = 1;
  }

  if(this.ship.x >= this.settings.fieldSize){
    this.ship.direction.x = -1;
  }

  if(this.ship.y <= 0){
    this.ship.direction.y = 1;
  }

  if(this.ship.y >= this.settings.fieldSize){
    this.ship.direction.y = -1;
  }

  this.ship.x += this.ship.direction.x;
  this.ship.y += this.ship.direction.y;
};

Ship.prototype._renderWebGL = function(renderer) {
  if(this.needUpdate){
    this.test();
    this.update();
  }
  if(this.glDirty) {
    this.dirty = true;
    this.glDirty = false;
  }
  renderer.setObjectRenderer(renderer.plugins[this.objectRenderer]);
  renderer.plugins[this.objectRenderer].render(this);
};

module.exports = Ship;
