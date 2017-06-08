
var engine = require('engine');

function FireEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 2000);

  this.blendMode = engine.BlendMode.ADD;

  this.vector = new engine.Point();
  
  this.makeParticles('texture-atlas', 'explosion-d.png');
};

FireEmitter.prototype = Object.create(engine.Emitter.prototype);
FireEmitter.prototype.constructor = FireEmitter;

FireEmitter.prototype.energy = function(colors) {
  var colors = colors || [0xFFFFFF, 0xFF0000],
      rnd = this.game.rnd;
  
  this.frequency = 100;
  this.lifespan = 150;

  this.setVelocity(rnd.integerInRange(5, 50), rnd.integerInRange(5, 50));
  this.setVector(rnd.frac(), rnd.frac());
  
  this.setScale(0.1, rnd.realInRange(0.25, 1), 150);
  this.setAlpha(1.0, 0.0, 150);

  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 150);
};

FireEmitter.prototype.pulse = function(colors) {
  var colors = colors || [0xFFFFFF, 0xFF0000],
      rnd = this.game.rnd;
  
  this.frequency = 100;
  this.lifespan = 200;

  this.setVelocity(0, 0);
  this.setVector(0, 0);
  
  this.setScale(0.25, 1.5, 100);
  this.setAlpha(1.0, 0.0, 200);

  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 100);
};

FireEmitter.prototype.laser = function(colors) {
  colors = colors || [0xFFFFFF, 0xFF0000];
  
  this.frequency = 100;
  this.lifespan = 150;

  this.setVelocity(0, 0);
  this.setVector(0, 0);
  
  this.setScale(0.25, 0.5, 150);
  this.setAlpha(1.0, 0.0, 150);

  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 250);
};

FireEmitter.prototype.rocket = function(colors) {
  colors = colors || [0xFF8888, 0x333333];

  this.frequency = 100;
  this.lifespan = 150;

  this.setVelocity(0, 0);
  this.setVector(0, 0);

  this.setScale(0.25, 1.0, 50);
  this.setAlpha(1.0, 0.0, 150);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 150);
};

FireEmitter.prototype.missile = function(colors) {
  colors = colors || [0xFF8888, 0x996666];

  this.frequency = 100;
  this.lifespan = 400;

  this.setVelocity(0, 0);
  this.setVector(0, 0);

  this.setScale(0.10, 0.20, 200);
  this.setAlpha(1.0, 0.0, 400);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 100);
};

FireEmitter.prototype.plasma = function(colors, vector) {
  colors = colors || [0xFFFFFF, 0xFF3333];

  this.frequency = 100;
  this.lifespan = 50;

  vector.normalize();

  this.setVelocity(12, 12);
  this.setVector(vector.x, vector.y);

  this.setScale(0.12, 0.18, 50);
  this.setAlpha(1.0, 0.0, 50);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 50);
};

FireEmitter.prototype.boost = function(colors, isPlayer) {
  colors = colors || [0xFFFFFF, 0xF4F4F4];

  this.frequency = 100;
  this.lifespan = 300;

  if(isPlayer){
    this.lifespan = 300;  //<---     
  }
  this.setVelocity(0, 0);
  this.setVector(0, 0);

  this.setScale(0.4, 0.6, 300);
  this.setAlpha(1.0, 0.0, 300);
  if(isPlayer){
    this.setScale(0.4, 0.6, 360); //<---
    this.setAlpha(1.0, 0.0, 300); //<---
  }

  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 1500); //<---
};

FireEmitter.prototype.piercing = function(colors, ship) {
  var movement = ship.movement,
      speed = movement._speed,
      vector = movement._vector,
      rnd = this.game.rnd,
      speed = rnd.realInRange(speed * 4.4, speed * 5.0);

  this.blendMode = engine.BlendMode.ADD;

  colors = colors || [0xFFDDDD, 0xFF9999];

  this.frequency = 100;
  this.lifespan = 1000;

  this.setVelocity(speed, speed);
  this.setVector(vector.x, vector.y);

  this.setScale(0.25, rnd.realInRange(0.75, 2.4), 1000);
  this.setAlpha(1.0, 0.0, 1000);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 1000);
};

module.exports = FireEmitter;
