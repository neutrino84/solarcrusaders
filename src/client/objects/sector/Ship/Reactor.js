
var engine = require('engine');

function Reactor(parent) {
  this.parent = parent;
  this.game = parent.game;
};

Reactor.prototype.constructor = Reactor;

Reactor.prototype.create = function() {
  this.shieldSprite = new engine.Sprite(this.game, 'texture-atlas', this.parent.name + '-shields.png');
  this.shieldSprite.blendMode = engine.BlendMode.ADD;
  this.shieldSprite.tint = 0x00FF00;

  this.electricitySprite = new engine.Sprite(this.game, 'texture-atlas', 'reactor-electricity.png');
  this.electricitySprite.blendMode = engine.BlendMode.ADD;
  this.electricitySprite.pivot.set(32, 32);
  this.electricitySprite.position.copy(this.parent.pivot);
  this.electricitySprite.tint = 0x00FF00;
};

Reactor.prototype.start = function() {
  this.shieldSprite.alpha = 1.0;

  this.animeTween = this.game.tweens.create(this.shieldSprite);
  this.animeTween.to({ alpha: 0.5 }, 1000, engine.Easing.Quadratic.InOut);
  this.animeTween.repeat();
  this.animeTween.start();

  this.timer = this.game.clock.events.repeat(50, 200, this._update, this);
  this.timer.once('completed', this.stop, this);
  
  this.parent.addChild(this.shieldSprite);
  this.parent.addChild(this.electricitySprite);
};

Reactor.prototype.stop = function() {
  this.game.clock.events.remove(this.timer);
  this.animeTween && this.animeTween.stop();
  
  this.parent.removeChild(this.shieldSprite);
  this.parent.removeChild(this.electricitySprite);
};

Reactor.prototype.destroy = function() {
  this.stop();
  this.parent = this.game = this.timer =
    this.electricitySprite = undefined;
};

Reactor.prototype._update = function() {
  var scale = global.Math.random() * 0.75 + 1.0,
      sprite = this.electricitySprite,
      parent = this.parent,
      glowEmitter = parent.manager.glowEmitter;
  if(global.Math.random() > 0.75) {
    sprite.alpha = global.Math.random();
    sprite.rotation = global.Math.random() * global.Math.PI;
    sprite.scale.set(scale, scale);

    glowEmitter.color(0x00FF00);
    glowEmitter.at({ center: parent.position });
    glowEmitter.explode(global.Math.floor(global.Math.random() * 2) + 1);
  } else {
    sprite.alpha = 0.25;
  }
};

module.exports = Reactor;
