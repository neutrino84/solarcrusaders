
var engine = require('engine');

function GlowEmitter(game) {
  engine.Emitter.call(this, game, 0, 0);

  this.blendMode = engine.BlendMode.ADD;
  this.setScale(1.0, 2.0, 1.0, 2.0, 500);
  this.setAlpha(1.0, 0.0, 1000);
  this.setTint(0xFFFFFF, 0xFF6666, 100);
  this.makeParticles('texture-atlas', 'explosion-d.png');
};

GlowEmitter.prototype = Object.create(engine.Emitter.prototype);
GlowEmitter.prototype.constructor = GlowEmitter;

GlowEmitter.prototype.color = function(color) {
  this.setTint(0xFFFFFF, color || 0xFF6666, 100);
};

module.exports = GlowEmitter;
