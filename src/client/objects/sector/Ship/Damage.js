
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
  this.fireEmitter = ship.manager.fireEmitter;

  this.deathExplosion = this.game.sound.add(('deathExplosion'),0,true)

};

Damage.prototype.constructor = Damage;


Damage.prototype.inflict = function(position) {
  console.log('DAMAGE INFLICTED')
  var game = this.game,
      ship = this.ship,
      fire = this.fireEmitter,
      point = new engine.Point(),
      spot = new engine.Sprite(this.game, 'texture-atlas', 'damage-' + (game.clock.frames % 2 == 0 ? 'a' : 'b') + '.png');

  spot.pivot.set(32, 32);
  spot.position.set(position.x, position.y);
  spot.scale.set(1.0, 1.0);
  spot.tint = 0xFF6666;
  spot.blendMode = engine.BlendMode.ADD;

  game.clock.events.add(2000, function() {
    spot.destroy();
  });

  game.clock.events.repeat(50, 20, function() {
    spot.alpha = global.Math.random();
    spot.worldTransform.apply({ x: 32, y: 32 }, point);
    game.world.worldTransform.applyInverse(point, point);

    fire.at({ center: point });
    fire.explode(1);
  });

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
  var ship = this.ship;
  
  this.game.soundManager.deathExplosion.play('', 0, 0.2, false);
  console.log('got to Damage.destroyed()')
  // shockwave
  // this.shockwave();

  // explosion glow
  this.glow.position.set(ship.x, ship.y);
  this.glowTween.start();
  this.glowTween.once('complete', function() {
    this.game.world.remove(this.glow);
  }, this);
  this.game.world.add(this.glow);

  // explosions 1
  this.timer1 = game.clock.events.repeat(200, 20, function() {
    var point = game.world.worldTransform.applyInverse(ship.worldTransform.apply(ship.circle.random()));
    
    this.explosionEmitter.at({ center: point });
    this.explosionEmitter.explode(2);
    
    this.glowEmitter.color(null);
    this.glowEmitter.at({ center: point });
    this.glowEmitter.explode(1);
  }, this);

  // explosions 2
  this.timer2 = this.game.clock.events.repeat(150, 30, function() {
    if(global.Math.random() > 0.5) {
      var point = this.game.world.worldTransform.applyInverse(ship.worldTransform.apply(ship.circle.random()));
      
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
  this.timer2 && this.game.clock.events.remove(this.timer2);

  this.ship = this.game =
    this.explosionEmitter = this.flashEmitter =
    this.glowEmitter = this.shockwaveEmitter = undefined;
};

module.exports = Damage;
