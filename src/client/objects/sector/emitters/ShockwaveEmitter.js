
var engine = require('engine');

function ShockwaveEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 500);

  this.vector = new engine.Point();

  this.makeParticles('texture-atlas', 'explosion-c.png');
};

ShockwaveEmitter.prototype = Object.create(engine.Emitter.prototype);
ShockwaveEmitter.prototype.constructor = ShockwaveEmitter;

ShockwaveEmitter.prototype.shockwave = function(colors) {
  colors = colors || [0xFFFFFF, 0xf4f4f4];
  
  this.blendMode = engine.BlendMode.ADD;

  this.frequency = 100;
  this.lifespan = 800;

  this.setVelocity(0, 0);
  this.setVector(0, 0);

  this.setScale(0.25, 2.0, 800);
  this.setAlpha(1.0, 0.0, 800);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 800);
};

ShockwaveEmitter.prototype.plasma = function(ship) {
  var movement = ship.movement,
      speed = movement._speed,
      vector = movement._vector,
      colors = [0xFF8888, 0xFFFFFF];
  
  this.blendMode = engine.BlendMode.ADD;

  this.frequency = 100;
  this.lifespan = 600;

  this.setVelocity(speed * 4, speed * 4);
  this.setVector(vector.x, vector.y);

  this.setScale(0.2, 0.4, 600);
  this.setAlpha(1.0, 0.0, 600);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 600);
};

ShockwaveEmitter.prototype.explosion = function(ship) {
  var movement = ship.movement,
      speed = movement._speed * 2,
      vector = movement._vector;

  this.frequency = 250;
  this.lifespan = 1000;

  this.setVelocity(speed * 2, speed * 2);
  this.setVector(vector.x, vector.y);

  this.setScale(0.0, ship.data.size / 4, 1000);
  this.setAlpha(1.0, 0.0, 1000);
  this.setTint(0xFFFFFF, 0x999999, 500);
};

module.exports = ShockwaveEmitter;
