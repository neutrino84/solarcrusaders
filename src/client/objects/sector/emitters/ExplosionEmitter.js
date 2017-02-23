
var engine = require('engine');

function ExplosionEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 500);

  this.makeParticles('texture-atlas', [
    'explosion-a.png', 'explosion-b.png'
  ]);
};

ExplosionEmitter.prototype = Object.create(engine.Emitter.prototype);
ExplosionEmitter.prototype.constructor = ExplosionEmitter;

ExplosionEmitter.prototype.small = function(vector, speed) {
  this.lifespan = 2000;

  this.blendMode = engine.BlendMode.ADD

  this.minRotation = -180;
  this.maxRotation = 180;

  this.setVelocity(speed, speed);
  this.setVector(vector.x, vector.y);

  this.setScale(0.5, 2.5, 1000);
  this.setAlpha(1.0, 0.0, 2000);
  this.setTint(0xFF8888, 0x181818, 500);
};

ExplosionEmitter.prototype.medium = function(vector, speed) {
  this.lifespan = 2000;

  this.minRotation = -120;
  this.maxRotation = 120;

  this.setVelocity(speed, speed);
  this.setVector(vector.x, vector.y);

  this.setScale(0.25, 4.0, 1000);
  this.setAlpha(1.0, 0.0, 2000);
  this.setTint(0xFF8888, 0x333333, 750);
};

ExplosionEmitter.prototype.large = function(vector, speed) {
  this.lifespan = 2000;

  this.minRotation = -60;
  this.maxRotation = 60;

  this.setVelocity(speed, speed);
  this.setVector(vector.x, vector.y);

  this.setScale(0.5, 6.0, 1000);
  this.setAlpha(1.0, 0.0, 2000);
  this.setTint(0xFF8888, 0x333333, 1000);
};

module.exports = ExplosionEmitter;
