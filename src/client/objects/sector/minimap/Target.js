var engine = require('engine');

function Target(game, shipSettings, settings) {
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
  if(this.ship.targetted){
    
    this.beginFill(0xffffff, 0.9);
  } else {
    this.beginFill(this.color, 0.9);
  }
  this.drawCircle(0, 0, this.thickness);
  this.endFill();

  this.needUpdate = true;
  // console.log(this.ship, this.settings)
  if(this.ship.targetted){
    // this.reticleRed = 15;

    this.reticleRed = new engine.Graphics(); 
    this.reticleRed.lineStyle(2, 0xcc1111, 1.0);
    this.reticleRed.drawRect(10, 10, 5, 5);
    this.reticleRed.alpha = 1;


    // this.reticleRed.pivot.set(halfWidth +2, halfHeight + 5);
    
    // console.log('ship targetted! reticle is ', this.reticleRed)
  }


  this.update();


};

Target.prototype = Object.create(engine.Graphics.prototype);
Target.prototype.constructor = Target;

Target.prototype.update = function(){
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

  // var distance = engine.Math.distance(positionWithZoom[0], positionWithZoom[1], userWithZoom[0], userWithZoom[1]);

  if(this.color !== 0x00ff00){
    this.visible = distance < this.settings.size / 2;
  }
    // this.visible = true;
};
module.exports = Target;
