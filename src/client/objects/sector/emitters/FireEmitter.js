
var engine = require('engine');

function FireEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 1000);

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
  this.lifespan = 300;

  this.setVelocity(rnd.integerInRange(5, 50), rnd.integerInRange(5, 50));
  this.setVector(rnd.frac(), rnd.frac());
  
  this.setScale(0.1, rnd.realInRange(0.25, 1), 300);
  this.setAlpha(1.0, 0.0, 300);

  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 150);
};

FireEmitter.prototype.pulse = function(colors) {
  var colors = colors || [0xFFFFFF, 0xFF0000],
      rnd = this.game.rnd;
  
  this.frequency = 100;
  this.lifespan = 300;

  this.setVelocity(rnd.integerInRange(-100, 100), rnd.integerInRange(-100, 100));
  this.setVector(rnd.frac(), rnd.frac());
  
  this.setScale(0.0, 0.5, 150);
  this.setAlpha(1.0, 0.0, 300);

  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 150);
};

FireEmitter.prototype.laser = function(colors) {
  colors = colors || [0xFFFFFF, 0xFF0000];
  
  this.frequency = 100;
  this.lifespan = 300;

  this.setVelocity(0, 0);
  this.setVector(0, 0);
  
  this.setScale(0.1, 2.0, 300);
  this.setAlpha(1.0, 0.0, 300);

  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 250);
};

FireEmitter.prototype.rocket = function(colors) {
  colors = colors || [0xFF8888, 0x333333];

  this.frequency = 100;
  this.lifespan = 300;

  this.setVelocity(0, 0);
  this.setVector(0, 0);

  this.setScale(0.25, 1.0, 300);
  this.setAlpha(1.0, 0.0, 300);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 300);
};

FireEmitter.prototype.plasma = function(colors, position) {
  colors = colors || [0xFFAAAA, 0xFF6666];

  this.frequency = 150;
  this.lifespan = 350;

  this.vector.set(this.emitX - position.x, this.emitY - position.y);
  this.vector.normalize();

  this.setVelocity(120, 120);
  this.setVector(this.vector.x, this.vector.y);

  this.setScale(0.15, 0.20, 150);
  this.setAlpha(1.0, 0.0, 350);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 350);
};

FireEmitter.prototype.boost = function(colors, movement) {
  colors = colors || [0xFFFFFF, 0xFF0000];

  this.frequency = 100;
  this.lifespan = 500;

  this.setVelocity(-movement._speed, -movement._speed);
  this.setVector(movement._vector.x, movement._vector.y);

  this.setScale(0.4, 0.6, 250);
  this.setAlpha(1.0, 0.0, 500);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 250);
};

module.exports = FireEmitter;
