var engine = require('engine');

function Ship(game, shipSettings, settings) {
  engine.Graphics.call(this, game);

  this.ship = shipSettings.ship;
  this.color = shipSettings.color
  this.ship.direction = {x: engine.Math.getRandomInt(-1, 1), y: engine.Math.getRandomInt(-1, 1)};

  if(this.ship.direction.x == 0 && this.ship.direction.y == 0){
    this.ship.direction = {x: 1, y: engine.Math.getRandomInt(-1, 1)};
  }

  this.settings = settings;

  this.thickness = this.ship.size * (2/90);

  this.lineStyle(0);
  this.beginFill(this.color, 0.9);
  this.drawCircle(0, 0, this.thickness);
  this.endFill();

  this.needUpdate = true;
  // console.log(this.ship, this.settings)
  this.update();
};

Ship.prototype = Object.create(engine.Graphics.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.update = function(){
  var zoom = this.settings.zoom,
      ship = this.ship,
      user = this.settings.user.ship;

  var positionWithZoom = [ship.x / zoom, ship.y / zoom];
  var userWithZoom = [user.x / zoom, user.y / zoom];
      // xplus = 100 - userWithZoom[0],
      // yplus = 100 - userWithZoom[1];

  // console.log(this.settings.size, this.settings.size/2)

    
  this.position.x = (this.settings.size / 2 + positionWithZoom[0] - userWithZoom[0]) ;

  this.position.y = (this.settings.size / 2 + positionWithZoom[1] - userWithZoom[1]) ;


  // this.position.x = this.settings.size / 2 ;
  // this.position.y = this.settings.size / 2 ;

  //GREEN
  if(this.color == 0x00ff00){
    this.position.x = 100;
    this.position.y = 100;
  }

  //YELLOW
  if(this.color == 0xFFFF00){
    // var xplus = 100 - user.x,
    //     yplus = 100 - user.y;


    // this.position.x = this.position.x + xplus;
    // this.position.y = this.position.y + yplus;
  }


  
  //RED
  // if(this.color == 0xFF0000){
  // this.position.x = 50;
  // this.position.y = 25;
  // }


  // if(this.color == 0x8A8A8A){
  // this.position.x = 75;
  // this.position.y = 150;
  // }
  // if(this.color == 0xFFFF00){
  // this.position.x = 50;
  // this.position.y = 50;
  // }

  // console.log(this.position.x, this.position.y, this.color)
  // this.visible = true
  var distance = engine.Math.distance(positionWithZoom[0], positionWithZoom[1], userWithZoom[0], userWithZoom[1]);
  // var distance = engine.Math.distance( position[0], position[1], user[0], user[1]);
  //GREEN
    // console.log('green distance is: ', distance)

  if(this.color !== 0x00ff00){
    this.visible = distance < this.settings.size / 2;
  }
    // this.visible = true;
};

// Ship.prototype.test = function(){
//   if(engine.Math.distance(this.ship.x, this.ship.y, this.settings.user.ship.x, this.settings.user.ship.y) / this.settings.zoom > this.settings.size / 2 - 2
//       && engine.Math.getRandomInt(0, 10) > 8){
//     this.ship.direction = engine.Math.reverseVector(this.ship.direction);
//   }

//   if(this.ship.x <= 0){
//     this.ship.direction.x = 1;
//   }

//   if(this.ship.x >= this.settings.fieldSize){
//     this.ship.direction.x = -1;
//   }

//   if(this.ship.y <= 0){
//     this.ship.direction.y = 1;
//   }

//   if(this.ship.y >= this.settings.fieldSize){
//     this.ship.direction.y = -1;
//   }

//   this.ship.x += this.ship.direction.x;
//   this.ship.y += this.ship.direction.y;
// };

// Ship.prototype._renderWebGL = function(renderer) {
//   if(this.needUpdate){
//     this.test();
//     this.update();
//   }
//   if(this.glDirty) {
//     this.dirty = true;
//     this.glDirty = false;
//   }
//   renderer.setObjectRenderer(renderer.plugins[this.objectRenderer]);
//   renderer.plugins[this.objectRenderer].render(this);
// };

module.exports = Ship;
