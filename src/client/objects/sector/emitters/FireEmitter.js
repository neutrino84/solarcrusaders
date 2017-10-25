
var engine = require('engine');

function FireEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 2000);

  this.blendMode = engine.BlendMode.ADD;

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
  var colors = colors || ['0xFFFFFF', '0xf0000'];
  
  this.lifespan = 200;

  this.setScale(0.25, 0.75, 200);
  this.setAlpha(1.0, 0.0, 200);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 100);
};

FireEmitter.prototype.laser = function(colors) {
  colors = colors || ['0xFFFFFF', '0xff0000'];

  this.lifespan = 150;

  this.setScale(0.25, 0.5, 150);
  this.setAlpha(1.0, 0.0, 150);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 250);
};

FireEmitter.prototype.boost = function(colors) {
  colors = colors || ['0xFFFFFF', '0xf4f4f4'];

  this.lifespan = 500;

  this.setScale(0.4, 0.6, 200);
  this.setAlpha(1.0, 0.0, 500);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 250);
};

module.exports = FireEmitter;
