
var engine = require('engine');

function Damage(ship) {
  this.ship = ship;
  this.game = ship.game;
  this.explosionEmitter = ship.manager.explosionEmitter;
  this.flashEmitter = ship.manager.flashEmitter;
  this.glowEmitter = ship.manager.glowEmitter;
};

Damage.prototype.constructor = Damage;

Damage.prototype.inflict = function(position) {
  if(this.ship.name === 'vessel-x04' || this.ship.name === 'vessel-x05') { return; }

  var point, tween,
      game = this.game,
      ship = this.ship,
      rotation = global.Math.random() * global.Math.PI,
      scale = global.Math.random() * 0.5 + 0.5,
      damage = new engine.Sprite(this.game, 'fx-atlas', 'damage-a.png');

  damage.pivot.set(32, 32);
  damage.position.set(ship.pivot.x - position.x, ship.pivot.y - position.y);
  damage.scale.set(scale, scale);
  damage.rotation = rotation;

  tween = this.game.tweens.create(damage);
  tween.to({ alpha: 0 }, 5000, engine.Easing.Default, false, 5000);
  tween.once('complete', function() {
    damage.destroy();
  }, this);
  tween.start();

  ship.addChild(damage);
};

Damage.prototype.destroyed = function() {
  var point,
      game = this.game,
      ship = this.ship;
      ship.destroyed = true;

  // burned
  ship.tint = 0x666666;
  for(var i in ship.children) {
    ship.children[i].tint = 0x666666;
  }

  game.clock.events.repeat(100, 20, function() {
    if(ship.worldTransform) {
      point = game.world.worldTransform.applyInverse(ship.worldTransform.apply(ship.circle.random()));
      this.explosionEmitter.at({ center: point });
      this.explosionEmitter.explode(1);
      this.glowEmitter.at({ center: point });
      this.glowEmitter.explode(4);
    }
  }, this);

  game.clock.events.repeat(250, 40, function() {
    if(global.Math.random() > 0.5 && ship.worldTransform) {
      point = game.world.worldTransform.applyInverse(ship.worldTransform.apply(ship.circle.random()));
      this.explosionEmitter.at({ center: point });
      this.explosionEmitter.explode(1);
      this.glowEmitter.at({ center: point });
      this.glowEmitter.explode(2);
    }
  }, this);

  // destroyed
  game.clock.events.add(2000, function() {
    ship.movement.throttle = 10.0;
  });
};

Damage.prototype.destroy = function() {

};

module.exports = Damage;
