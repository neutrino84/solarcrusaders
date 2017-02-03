
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

  this.isDone = false;
  this.isRunning = false;

  this.target = new engine.Point();
  this.origin = new engine.Point();
  this.destination = new engine.Point();
  this.offset = new engine.Point(this.spread.x, this.spread.y);
  
  this.projectile = new engine.Sprite(this.game, 'texture-atlas', this.data.texture);
  this.projectile.scale.set(0.5, 0.5);
  this.projectile.pivot.set(32, 32);
  this.projectile.position.set(0, 16);
  this.projectile.rotation = global.Math.PI * global.Math.random();
};

Projectile.prototype.start = function(destination, duration, delay) {
  this.elapsed = 0;
  this.duration = duration * this.data.projection;
  this.delay = delay;
  this.started = this.clock.time + delay;

  this.isDone = false;
  this.isRunning = true;
  this.hasExploded = false;

  this.length = this.data.length;
  this.runtime = this.duration + this.length;

  this.target.copyFrom(destination);
  this.destination.copyFrom(destination);

  this.parent.fxGroup.addChild(this.projectile);
};

Projectile.prototype.stop = function() {
  this.isRunning = false;
  this.parent.fxGroup.removeChild(this.projectile);
};

Projectile.prototype.explode = function() {
  this.parent.fireEmitter.at({ center: this.destination });
  this.parent.fireEmitter.explode(1);

  if(!this.hasExploded) {
    this.parent.explode(this.destination);
  }

  this.hasExploded = true;
};

Projectile.prototype.update = function() {
  var f1, f2, f3;

  if(this.isRunning === true) {
    this.elapsed = this.clock.time - this.started;

    if(this.elapsed < 0) { return; }

    f1 = this.elapsed/this.runtime;

    this.destination.x = this.target.x + (this.offset.x * f1);
    this.destination.y = this.target.y + (this.offset.y * f1);

    // update orig / dest
    this.origin.copyFrom(this.parent.updateTransform(this.destination));

    this.projectile.position.x = this.destination.x;
    this.projectile.position.y = this.destination.y;

    if(this.elapsed > this.runtime) {
      this.explode();
      this.stop();
    }
  }
};

Projectile.prototype.destroy = function() {
  this.isRunning && this.stop();

  this.texture.destroy();
  this.strip.destroy();
  this.glow.destroy();

  this.parent = this.game = 
    this.data = this.clock = this._start =
    this._end = this.destination = this.origin =
    this.target = this.offset = undefined;
};

module.exports = Projectile;
