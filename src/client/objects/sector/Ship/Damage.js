
var engine = require('engine');

function Damage(ship) {
  this.ship = ship;
  this.game = ship.game;
  this.explosionEmitter = ship.manager.explosionEmitter;
  this.flashEmitter = ship.manager.flashEmitter;
  this.glowEmitter = ship.manager.glowEmitter;
  this.shockwaveEmitter = ship.manager.shockwaveEmitter;
};

Damage.prototype.constructor = Damage;

Damage.prototype.inflict = function(position) {
  var point, tween, timer,
      game = this.game,
      ship = this.ship,
      rotation = global.Math.random() * global.Math.PI,
      scale = global.Math.random() * 0.5 + 0.25,
      damage = new engine.Sprite(this.game, 'texture-atlas', 'damage-a.png'),
      spot = new engine.Sprite(this.game, 'texture-atlas', 'damage-b.png');

  damage.pivot.set(32, 32);
  damage.position.set(position.x, position.y);
  damage.scale.set(scale, scale);
  damage.rotation = rotation;
  damage.tint = 0x000000;

  spot.pivot.set(32, 32);
  spot.position.set(position.x, position.y);
  spot.scale.set(0.5, 0.5);
  spot.tint = 0xFF6666;
  spot.blendMode = engine.BlendMode.ADD;

  damageTween = this.game.tweens.create(damage);
  damageTween.to({ alpha: 0 }, 4000, engine.Easing.Quadratic.InOut, true, 1000);
  damageTween.once('complete', function() {
    damage.destroy();
  }, this);

  timer = game.clock.events.repeat(50, 40, function() { spot.alpha = global.Math.random(); });
  timer.on('complete', function() { spot.destroy(); });

  ship.addChild(damage);
  ship.addChild(spot);
};

Damage.prototype.shockwave = function() {
  this.shockwaveEmitter.at({ center: this.ship.position });
  this.shockwaveEmitter.explode(2);
};

Damage.prototype.destroyed = function() {
  var point,
      game = this.game,
      ship = this.ship;

  ship.destroyed = true;
  ship.engineCore.destroy();

  ship.movement.animation.stop();
  // this.shockwave();

  // burned
  ship.tint = 0x444444;
  for(var i in ship.children) {
    ship.children[i].tint = 0x444444;
  }

  this.timer1 = game.clock.events.repeat(100, 20, function() {
    if(ship.worldTransform) {
      point = game.world.worldTransform.applyInverse(ship.worldTransform.apply(ship.circle.random()));
      
      this.explosionEmitter.at({ center: point });
      this.explosionEmitter.explode(2);
      
      this.glowEmitter.color(null);
      this.glowEmitter.at({ center: point });
      this.glowEmitter.explode(1);
    }
  }, this);

  this.timer2 = game.clock.events.repeat(200, 25, function() {
    if(global.Math.random() > 0.5 && ship.worldTransform) {
      point = game.world.worldTransform.applyInverse(ship.worldTransform.apply(ship.circle.random()));
      
      this.explosionEmitter.at({ center: point });
      this.explosionEmitter.explode(2);
      
      this.glowEmitter.color(null);
      this.glowEmitter.at({ center: point });
      this.glowEmitter.explode(1);
    }
  }, this);
};

Damage.prototype.destroy = function() {
  this.timer1 && this.game.clock.events.remove(this.timer1);
  this.timer2 &&this.game.clock.events.remove(this.timer2);

  this.ship = this.game =
    this.explosionEmitter = this.flashEmitter =
    this.glowEmitter = this.shockwaveEmitter = undefined;
};

module.exports = Damage;
