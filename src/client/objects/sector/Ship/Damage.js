
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
  if(this.ship.name === 'vessel-x04' || this.ship.name === 'vessel-x05') { return; }
  if(global.Math.random() > 0.25) { return; }

  var point, tween,
      game = this.game,
      ship = this.ship,
      rotation = global.Math.random() * global.Math.PI,
      scale = global.Math.random() * 0.5 + 0.5,
      damage = new engine.Sprite(this.game, 'texture-atlas', 'damage-a.png');

  damage.pivot.set(32, 32);
  damage.position.set(ship.pivot.x - position.x, ship.pivot.y - position.y);
  damage.scale.set(scale, scale);
  damage.rotation = rotation;
  damage.tint = 0x000000;

  tween = this.game.tweens.create(damage);
  tween.to({ alpha: 0 }, 5000, engine.Easing.Default, false, 5000);
  tween.once('complete', function() {
    damage.destroy();
  }, this);
  tween.start();

  ship.addChild(damage);
};

Damage.prototype.shockwave = function() {
  this.shockwaveEmitter.at({ center: this.ship.position });
  this.shockwaveEmitter.explode(10);
};

Damage.prototype.destroyed = function() {
  var point,
      game = this.game,
      ship = this.ship;

  ship.destroyed = true;
  ship.engineCore.destroy();

  ship.movement.animation.stop();
  this.shockwave();

  // burned
  ship.tint = 0x444444;
  for(var i in ship.children) {
    ship.children[i].tint = 0x444444;
  }

  game.clock.events.repeat(100, 20, function() {
    if(ship.worldTransform) {
      point = game.world.worldTransform.applyInverse(ship.worldTransform.apply(ship.circle.random()));
      
      this.explosionEmitter.at({ center: point });
      this.explosionEmitter.explode(1);
      
      this.glowEmitter.color(null);
      this.glowEmitter.at({ center: point });
      this.glowEmitter.explode(4);
    }
  }, this);

  game.clock.events.repeat(200, 25, function() {
    if(global.Math.random() > 0.5 && ship.worldTransform) {
      point = game.world.worldTransform.applyInverse(ship.worldTransform.apply(ship.circle.random()));
      
      this.explosionEmitter.at({ center: point });
      this.explosionEmitter.explode(1);
      
      this.glowEmitter.color(null);
      this.glowEmitter.at({ center: point });
      this.glowEmitter.explode(2);
    }
  }, this);
};

Damage.prototype.destroy = function() {
  this.ship = this.game =
    this.explosionEmitter = this.flashEmitter =
    this.glowEmitter = this.shockwaveEmitter = undefined;
};

module.exports = Damage;
