
var pixi = require('pixi'),
    engine = require('engine');

function Projectile(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.data = parent.data;
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
  this.offset = new engine.Point(global.Math.random() * 256 - 256 / 2, global.Math.random() * 256 - 256 / 2);

  this.projectile = new engine.Sprite(this.game, 'texture-atlas', this.data.texture);
  this.projectile.scale.set(0.5, 0.5);
  this.projectile.pivot.set(32, 32);
};

Projectile.prototype.start = function(destination, distance, spawn, index) {
  this.elapsed = 0;
  this.duration = distance * this.data.projection;
  this.runtime = this.duration + this.length;
  this.delay = ((this.runtime / spawn) * index) + (this.data.delay/spawn * (global.parseInt(this.data.slot) + 1));
  this.started = this.clock.time + this.delay;

  this.isRunning = true;
  this.hasExploded = false;

  this.length = this.data.length;
  this.runtime = this.duration + this.length;

  this.destination.set(destination.x + this.spread.x, destination.y + this.spread.y);

  this.parent.subGroup.addChild(this.projectile);
};

Projectile.prototype.stop = function() {
  this.isRunning = false;
  this.parent.subGroup.removeChild(this.projectile);
};

Projectile.prototype.explode = function() {
  var parent = this.parent,
      rnd = this.game.rnd;
  if(!this.hasExploded) {
    this.parent.explosionEmitter.small({ x: rnd.frac(), y: rnd.frac() }, rnd.realInRange(-5, 5));
    this.parent.explosionEmitter.at({ center: this.projectile.position });
    this.parent.explosionEmitter.explode(4);
  }
  this.hasExploded = true;
};

Projectile.prototype.update = function() {
  var f1, sin;

  if(this.isRunning === true) {
    this.elapsed = this.clock.time - this.started;

    if(this.elapsed < 0) { return; }

    this.origin.copyFrom(this.parent.updateTransform());

    f1 = this.elapsed/this.runtime;

    this.origin.interpolate(this.destination, engine.Easing.Quadratic.In(f1), this.target);

    this.projectile.position.x = this.target.x;
    this.projectile.position.y = this.target.y;
    this.projectile.rotation = this.target.angle(this.destination);

    if(this.elapsed > this.runtime) {
      this.explode();
      this.stop();
    }
  }
};

Projectile.prototype.destroy = function() {
  this.isRunning && this.stop();

  this.projectile.destroy();

  this.parent = this.game = 
    this.data = this.clock = this._start =
    this._end = this.destination = this.origin =
    this.target = this.offset = undefined;
};

module.exports = Projectile;
