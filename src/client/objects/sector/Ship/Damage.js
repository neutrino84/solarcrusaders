
var engine = require('engine')

function Damage(parent) {
  this.parent = parent;
  this.game = parent.game;
};

Damage.prototype.constructor = Damage;

Damage.prototype.create = function() {
  // this.sprite = new engine.Sprite(this.game, 'texture-atlas', this.parent.data.chassis + '.png');
};

// Damage.prototype.start = function() {
//   this.tween && this.tween.stop(true);
//   this.tween = this.game.tweens.create(this.sprite);
//   this.tween.to({ alpha: 0.5 }, 500, engine.Easing.Quadratic.InOut);
//   this.tween.yoyo(true);
//   this.tween.repeat();
//   this.tween.on('complete', this.remove, this);
//   this.tween.start();

//   this.parent.addChild(this.sprite);
// };

// Damage.prototype.stop = function() {
//   this.tween && this.tween.stop(true);
// };

// Damage.prototype.remove = function() {
//   this.sprite.alpha = 0.0;
//   this.parent.removeChild(this.sprite);
// }

// Damage.prototype.destroy = function() {
//   this.stop();
//   this.parent = this.game = undefined;
// };

module.exports = Damage;
