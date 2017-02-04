
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
  this.offset = new engine.Point(16, 16);
  
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

  this.isDone = true;
  this.isRunning = true;
  this.hasExploded = false;

  this.length = this.data.length;
  this.runtime = this.duration + this.length;

  this.destination.set(destination.x + this.spread.x, destination.y + this.spread.y);

  this.parent.fxGroup.addChild(this.projectile);
};

Projectile.prototype.stop = function() {
  this.isRunning = false;
  this.parent.fxGroup.removeChild(this.projectile);
};

Projectile.prototype.explode = function() {
  if(!this.hasExploded) {
    this.parent.explode(this.destination);
  }

  this.hasExploded = true;
};

Projectile.prototype.update = function() {
  var f1, sin;

  if(this.isRunning === true) {
    this.elapsed = this.clock.time - this.started;

    if(this.elapsed < 0) {
      this.origin.copyFrom(this.parent.updateTransform());
      return;
    }

    f1 = this.elapsed/this.runtime;
    sin = global.Math.sin(this.elapsed * 0.01);
    
    this.origin.interpolate(this.destination, f1, this.target);

    this.projectile.position.x = this.target.x + (this.offset.x * sin);
    this.projectile.position.y = this.target.y + (this.offset.y * sin);
    this.projectile.rotation = this.target.angle(this.destination);

    this.parent.flashEmitter.at({ center: this.projectile.position });
    this.parent.flashEmitter.explode(1);

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
