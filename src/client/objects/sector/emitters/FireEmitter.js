
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
  var colors = colors || ['0xFFFFFF', '0xFF0000'],
      rnd = this.game.rnd;

  this.lifespan = 300;

  this.setVelocity(rnd.integerInRange(5, 50), rnd.integerInRange(5, 50));
  this.setVector(rnd.frac(), rnd.frac());

  this.setScale(0.25, 1.5, 300);
  this.setAlpha(1.0, 0.0, 300);

  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 150);
};

FireEmitter.prototype.pulse = function(colors) {
  var colors = colors || ['0xFFFFFF', '0xFF0000'],
      rnd = this.game.rnd;
  
  this.lifespan = 200;

  this.setVector(0, 0);
  this.setVelocity(0, 0);
  
  this.setScale(0.25, 0.75, 200);
  this.setAlpha(1.0, 0.0, 200);

  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 100);
};

FireEmitter.prototype.laser = function(colors) {
  colors = colors || ['0xFFFFFF', '0xFF0000'];

  this.lifespan = 150;

  this.setVelocity(0, 0);
  this.setVector(0, 0);

  this.setScale(0.25, 0.5, 150);
  this.setAlpha(1.0, 0.0, 150);

  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 250);
};

FireEmitter.prototype.rocket = function(colors) {
  var colors = colors || ['0xFF9999', '0xFFFFFF'],
      rnd = this.game.rnd,
      velocity = -100;

  this.lifespan = 300;

  this.setVelocity(0, 0);
  this.setVector(0, 0);

  this.setScale(0.28, 0.32, 300);
  this.setAlpha(1.0, 0.0, 300);

  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 150);
};

FireEmitter.prototype.plasma = function(colors) {
  var colors = colors || ['0xFFDDDD', '0xFFFFFF'];

  this.lifespan = 1200;

  this.setVelocity(0, 0);
  this.setVector(0, 0);

  this.setScale(1.0, 0.4, 800);
  this.setAlpha(1.0, 0.0, 1200);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 400);
};

FireEmitter.prototype.missile = function(colors) {
  colors = colors || ['0xFF8888', '0x996666'];

  this.lifespan = 300;

  this.setVelocity(0, 0);
  this.setVector(0, 0);

  this.setScale(0.26, 0.24, 300);
  this.setAlpha(1.0, 0.0, 300);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 100);
};

FireEmitter.prototype.boost = function(colors) {
  colors = colors || ['0xFFFFFF', '0xF4F4F4'];

  this.lifespan = 500;

  this.setVelocity(0, 0);
  this.setVector(0, 0);

  this.setScale(0.4, 0.6, 200);
  this.setAlpha(1.0, 0.0, 500);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 250);
};

module.exports = FireEmitter;
