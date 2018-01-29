
var engine = require('engine');

function FireEmitter(game) {
  engine.Emitter.call(this, game, 0, 0, 4000);

  this.name = 'fire';
  this.blendMode = engine.BlendMode.ADD;
  this.makeParticles('texture-atlas', 'explosion-d.png');
};

FireEmitter.prototype = Object.create(engine.Emitter.prototype);
FireEmitter.prototype.constructor = FireEmitter;

FireEmitter.prototype.energy = function(colors) {
  var colors = colors || ['0xffffff', '0xffffff'],
      rnd = this.game.rnd;

  this.lifespan = 300;

  this.setVelocity(rnd.integerInRange(-200, 200), rnd.integerInRange(-200, 200));
  this.setVector(rnd.frac(), rnd.frac());

  this.setScale(0.2, 0.4, 300);
  this.setAlpha(1.0, 0.0, 300);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 150);
};

FireEmitter.prototype.pulse = function(colors) {
  var colors = colors || ['0xffffff', '0xffffff'],
      rnd = this.game.rnd;
  
  this.lifespan = 300;

  this.setVelocity(rnd.integerInRange(-256, 256), rnd.integerInRange(-256, 256));
  this.setVector(rnd.frac(), rnd.frac());

  this.setScale(0.22, 0.44, 300);
  this.setAlpha(1.0, 0.0, 300);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 300);
};

FireEmitter.prototype.boost = function(colors) {
  colors = colors || ['0xffffff', '0xffffff'];

  this.lifespan = 600;

  this.setVelocity(0, 0);
  this.setVector(0, 0);

  this.setScale(0.12, 0.24, 200);
  this.setAlpha(1.0, 0.0, 600);
  this.setTint(global.parseInt(colors[0]), global.parseInt(colors[1]), 600);
};

FireEmitter.prototype.projectile = function(colors) {
  colors = colors || ['0xffffff', '0xffffff'];

  this.lifespan = 200;

  this.setScale(0.04, 0.18, 200);
  this.setAlpha(1.0, 0.0, 200);
  this.setTint(0xff9999, 0x999999, 200);
};

module.exports = FireEmitter;
