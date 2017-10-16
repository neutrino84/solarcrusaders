
var pixi = require('pixi'),
    engine = require('engine');

function Projectile(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.ship = parent.ship;
  this.data = parent.data;
  this.manager = parent.manager;
  this.clock  = parent.game.clock;
  this.spread = {
    x: global.Math.random() * this.data.spread - this.data.spread / 2,
    y: global.Math.random() * this.data.spread - this.data.spread / 2
  }

  this.started = 0;
  this.elapsed = 0;
  this.length = 0;
  this.duration = 0;

  this.isDone = true;
  this.isRunning = false;

  this.target = new engine.Point();
  this.origin = new engine.Point();
  this.destination = new engine.Point();

  this.projectile = new engine.Sprite(this.game, 'texture-atlas', this.data.texture);
  this.projectile.scale.set(0.8, 0.8);
  this.projectile.pivot.set(32, 32);
  this.projectile.alpha = 0.0;
};

Projectile.prototype.start = function(destination, distance, spawn, index, slot, total) {
  this.elapsed = 0;
  this.duration = distance * this.data.projection;
  this.length = this.data.length;
  this.runtime = this.duration;
  this.delay = this.data.delay + (this.duration * ((index) / (spawn+1))) + (this.parent.ship.data.rate * this.game.rnd.realInRange(0.0, 1.0) * (slot/total));
  this.started = this.clock.time + this.delay;

  this.isRunning = true;
  this.hasExploded = false;

  this.destination.set(destination.x + this.spread.x, destination.y + this.spread.y);

  this.manager.fxGroup.addChild(this.projectile);
};

Projectile.prototype.stop = function() {
  this.isRunning = false;
  this.projectile.alpha = 0.0;
  this.manager.fxGroup.removeChild(this.projectile);
};

Projectile.prototype.explode = function() {
  if(!this.hasExploded) {
    this.hasExploded = true;

    this.manager.explosionEmitter.rocket();
    this.manager.explosionEmitter.at({ center: this.projectile.position });
    this.manager.explosionEmitter.explode(2);

    this.manager.shockwaveEmitter.rocket();
    this.manager.shockwaveEmitter.at({ center: this.projectile.position });
    this.manager.shockwaveEmitter.explode(1);
  }
};

Projectile.prototype.update = function() {
  var f1, f2;

  if(this.isRunning === true) {
    this.elapsed = this.clock.time - this.started;

    if(this.elapsed < 0) {
      f2 = 1-(-this.elapsed/this.delay);

      this.origin.copyFrom(this.parent.updateTransform());

      this.projectile.position.x = this.origin.x;
      this.projectile.position.y = this.origin.y;
      this.projectile.rotation = this.origin.angle(this.destination);
      this.projectile.alpha = f2;

      return;
    }

    f1 = this.elapsed/this.runtime;

    this.origin.interpolate(this.destination, engine.Easing.Quadratic.In(f1), this.target);

    this.projectile.position.x = this.target.x;
    this.projectile.position.y = this.target.y;
    this.projectile.rotation = this.target.angle(this.destination);

    if(f1 < 0.5) {
      this.manager.fireEmitter.rocket();
      this.manager.fireEmitter.at({ center: this.projectile.position });
      this.manager.fireEmitter.explode(1);
    }

    if(this.elapsed > this.runtime) {
      this.explode();
      this.stop();
    }
  }
};

Projectile.prototype.destroy = function() {
  this.isRunning && this.stop();

  this.projectile.destroy();

  this.parent = this.ship = this.game = this.manager =
    this.data = this.clock = this._start =
    this._end = this.destination = this.origin =
    this.target = this.offset = undefined;
};

module.exports = Projectile;
