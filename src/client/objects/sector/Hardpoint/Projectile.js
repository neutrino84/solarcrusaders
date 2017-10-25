
var pixi = require('pixi'),
    engine = require('engine');

function Projectile(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.data = parent.data;
  this.ship = parent.ship;
  this.manager = parent.manager;
  this.state = parent.manager.state;
  this.clock  = parent.game.clock;
  this.spread = {
    x: global.Math.random() * this.data.spread - this.data.spread / 2,
    y: global.Math.random() * this.data.spread - this.data.spread / 2
  }

  this.started = 0;
  this.elapsed = 0;
  this.length = 0;
  this.duration = 0;
  this.offset = 0;

  this.isDone = true;
  this.isRunning = false;
  this.hasExploded = false;

  this.temp = new engine.Point();
  this.origin = new engine.Point();
  this.destination = new engine.Point();

  this.projectile = new engine.Sprite(this.game, 'texture-atlas', this.data.texture);
  this.projectile.scale.set(1.0, 1.0);
  this.projectile.pivot.set(16, 16);
  this.projectile.blendMode = engine.BlendMode.ADD;

  this.glow = new engine.Sprite(this.game, 'texture-atlas', 'explosion-d.png');
  this.glow.pivot.set(64, 64);
  this.glow.position.set(16, 16);
  this.glow.scale.set(0.5, 0.5);
  this.glow.tint = global.parseInt(this.data.glow);
  this.glow.blendMode = engine.BlendMode.ADD;

  this.projectile.addChild(this.glow);
};

Projectile.prototype.start = function(destination, distance, spawn, index, slot, total) {
  this.elapsed = 0;
  this.length = this.data.length;
  this.duration = distance * this.data.projection;
  this.runtime = this.duration + this.length;
  this.offset = this.game.rnd.realInRange(this.data.offset.min, this.data.offset.max);
  this.delay = this.data.delay + (this.parent.ship.data.rate*this.offset*slot/total)
  this.started = this.clock.time + this.delay;

  this.isRunning = true;
  this.hasExploded = false;

  this.destination.copyFrom(destination);
  this.destination.add(this.spread.x, this.spread.y)
  this.origin.copyFrom(this.parent.updateTransform());
  this.glow.alpha = 0.0;

  this.manager.fxGroup.addChild(this.projectile);
};

Projectile.prototype.stop = function() {
  this.isRunning = false;
  this.manager.fxGroup.removeChild(this.projectile);
};

Projectile.prototype.explode = function() {
  if(!this.hasExploded) {
    this.hasExploded = true;

    this.state.explosionEmitter.projectile();
    this.state.explosionEmitter.at({ center: this.projectile.position });
    this.state.explosionEmitter.explode(1);
  }
};

Projectile.prototype.update = function() {
  var f1, f2;

  if(this.isRunning === true) {
    this.elapsed = this.clock.time - this.started;

    if(this.elapsed < 0) {
      f2 = 1-(-this.elapsed/this.delay);

      this.origin.copyFrom(this.parent.updateTransform());
      this.projectile.position.copy(this.origin);
      this.projectile.rotation = this.destination.angle(this.origin);
      this.projectile.alpha = 0.0;

      return;
    }

    f1 = this.elapsed/this.duration;

    this.origin.interpolate(this.destination, f1, this.temp);

    this.projectile.position.copy(this.temp);
    this.projectile.rotation = this.destination.angle(this.temp);
    this.projectile.alpha = 0.5 * f1 + 0.5;
    this.glow.alpha = f1;

    // stop once done
    if(this.elapsed > this.duration) {
      this.explode();
      this.stop();
    }
  }
};

Projectile.prototype.destroy = function() {
  this.isRunning && this.stop();

  this.projectile.destroy();

  this.game = this.parent = this.ship = this.manager =
    this.data = this.clock = this.destination = this.origin =
    this.temp = undefined;
};

module.exports = Projectile;
