
var engine = require('engine');

function Damage(ship) {
  this.ship = ship;
  this.game = ship.game;

  this.glow = new engine.Sprite(this.game, 'texture-atlas', 'explosion-d.png');
  this.glow.pivot.set(64, 64);
  this.glow.scale.set(24.0, 24.0);
  this.glow.blendMode = engine.BlendMode.ADD;
  this.glow.tint  = 0xffffff;
  this.glow.alpha = 0.0;

  this.glowTween = this.game.tweens.create(this.glow);
  this.glowTween.to({ alpha: 0.8 }, 250, engine.Easing.Quadratic.InOut);
  this.glowTween.to({ alpha: 0.6 }, 2000, engine.Easing.Quadratic.InOut);
  this.glowTween.to({ alpha: 0.0 }, 3000, engine.Easing.Quadratic.InOut);
  
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
    spot.destroy();
  }, this);

  timer = game.clock.events.repeat(50, 40, function() { spot.alpha = global.Math.random(); });

  ship.addChild(damage);
  ship.addChild(spot);
};

Damage.prototype.shockwave = function() {
  this.shockwaveEmitter.at({ center: this.ship.position });
  this.shockwaveEmitter.explode(2);

  this.game.emit('fx/shockwave', {
    width: 1024,
    height: 1024,
    duration: 4000,
    x: this.ship.x - (512),
    y: this.ship.y - (512)
  });
};

Damage.prototype.destroyed = function() {
  var point,
      game = this.game,
      ship = this.ship;

  ship.destroyed = true;
  ship.movement.animation.stop();
  
  this.shockwave();

  this.glow.position.set(ship.x, ship.y);
  this.game.world.add(this.glow);

  this.glowTween.start();
  this.glowTween.once('complete', function() {
    this.game.world.remove(this.glow);
  }, this);

  // burned
  ship.tint = 0x444444;
  for(var i in ship.children) {
    ship.children[i].tint = 0x444444;
  }

  this.timer1 = game.clock.events.repeat(200, 20, function() {
    if(ship.worldTransform) {
      point = game.world.worldTransform.applyInverse(ship.worldTransform.apply(ship.circle.random()));
      
      this.explosionEmitter.at({ center: point });
      this.explosionEmitter.explode(2);
      
      this.glowEmitter.color(null);
      this.glowEmitter.at({ center: point });
      this.glowEmitter.explode(1);
    }
  }, this);

  this.timer2 = game.clock.events.repeat(150, 20, function() {
    if(global.Math.random() > 0.5 && ship.worldTransform) {
      point = game.world.worldTransform.applyInverse(ship.worldTransform.apply(ship.circle.random()));
      
      this.explosionEmitter.at({ center: point });
      this.explosionEmitter.explode(2);
      
      this.glowEmitter.color(null);
      this.glowEmitter.at({ center: point });
      this.glowEmitter.explode(1);
    }
  }, this);

  this.timer3 = game.clock.events.add(10000, function() {
    ship.destroyed = false;

    // unburned
    ship.tint = 0xFFFFFF;
    for(var i in ship.children) {
      ship.children[i].tint = 0xFFFFFF;
    }
  }, this);
};

Damage.prototype.destroy = function() {
  this.timer1 && this.game.clock.events.remove(this.timer1);
  this.timer2 && this.game.clock.events.remove(this.timer2);
  this.timer3 && this.game.clock.events.remove(this.timer3);

  this.ship = this.game =
    this.explosionEmitter = this.flashEmitter =
    this.glowEmitter = this.shockwaveEmitter = undefined;
};

module.exports = Damage;
