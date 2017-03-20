
var pixi = require('pixi'),
    engine = require('engine');

function Plasma(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.data = parent.data;
  this.ship = parent.ship;
  this.sprite = parent.sprite;
  this.clock  = parent.game.clock;

  this.spread = {
    x: this.game.rnd.realInRange(-this.data.spread, this.data.spread),
    y: this.game.rnd.realInRange(-this.data.spread, this.data.spread)
  }

  this.started = 0;
  this.elapsed = 0;
  this.length = 0;
  this.duration = 0;

  this.isDone = false;
  this.isRunning = false;
  this.hasExploded = false;

  this.target = new engine.Point();
  this.origin = new engine.Point();
  this.destination = new engine.Point();
  this.emitter = new engine.Point();

  this.plasma = new engine.Sprite(this.game, 'texture-atlas', this.data.texture);
  this.plasma.scale.set(0.5, 0.5);
  this.plasma.pivot.set(64, 64);

  this.glow = new engine.Sprite(this.game, 'texture-atlas', 'damage-a.png');
  this.glow.pivot.set(32, 32);
  this.glow.position.set(16, 16);
  this.glow.tint = global.parseInt(this.data.glow);
  this.glow.blendMode = engine.BlendMode.ADD;
  this.glow.alpha = 0.0;

  this.parent.cap.tint = 0xFF9999;
};

Plasma.prototype.start = function(destination, distance, spawn, index) {
  this.elapsed = 0;
  this.length = this.data.length;
  this.duration = distance * this.data.projection + (index * this.length);
  this.delay = this.data.delay;
  this.runtime = this.duration + this.length;
  this.started = this.clock.time + this.delay;

  this.isRunning = true;
  this.hasExploded = false;

  this.origin.copyFrom(this.parent.updateTransform());
  this.destination.copyFrom(destination);
  this.destination.add(this.spread.x, this.spread.y);

  this.parent.sprite.addChildAt(this.glow);
  this.parent.fxGroup.addChild(this.plasma);

  this.parent.shockwaveEmitter.plasma(this.ship);
  this.parent.shockwaveEmitter.at({ center: this.origin });
  this.parent.shockwaveEmitter.explode(2);
};

Plasma.prototype.stop = function() {
  this.isDone = true;
  this.isRunning = false;

  this.parent.sprite.removeChild(this.glow);
  this.parent.fxGroup.removeChild(this.plasma);
};

Plasma.prototype.explode = function() {
  if(!this.hasExploded) {
    this.hasExploded = true;

    this.parent.explosionEmitter.rocket();
    this.parent.explosionEmitter.at({ center: this.plasma.position });
    this.parent.explosionEmitter.explode(2);

    this.parent.explosionEmitter.plasma();
    this.parent.explosionEmitter.at({ center: this.plasma.position });
    this.parent.explosionEmitter.explode(2);
  }
};

Plasma.prototype.update = function() {
  var f0 = f1 = 0.001;

  if(this.isRunning === true) {
    this.elapsed = this.clock.time - this.started;

    this.origin.copyFrom(this.parent.updateTransform());

    f1 = this.elapsed/this.runtime;
    f0 = 1-f1;

    this.glow.scale.set(f0*2, f0*2);
    this.glow.alpha = f0;

    this.origin.interpolate(this.destination, engine.Easing.Quadratic.In(f1), this.target);

    this.plasma.position.x = this.target.x;
    this.plasma.position.y = this.target.y;
    this.plasma.rotation = this.destination.angle(this.target);

    this.parent.fireEmitter.plasma(null, engine.Point.subtract(this.target, this.destination, this.emitter));
    this.parent.fireEmitter.at({ center: this.plasma.position });
    this.parent.fireEmitter.explode(1);

    // this.angle = this.origin.angle(this.destination);

    // var r = engine.Math.clamp(this.sprite.rotation, -global.Math.PI, global.Math.PI);
    // var cs = (1-f1) * global.Math.cos(r) + f1 * global.Math.cos(this.angle);
    // var sn = (1-f1) * global.Math.sin(r) + f1 * global.Math.sin(this.angle);
    // var c = global.Math.atan2(sn, cs);
      
    // this.sprite.rotation = c-this.ship.rotation;

    if(this.elapsed > this.runtime) {
      this.explode();
      this.stop();
    }
  }
};

Plasma.prototype.destroy = function() {
  this.isRunning && this.stop();

  this.plasma.destroy();

  this.parent = this.game = 
    this.data = this.clock = this._start =
    this._end = this.destination = this.origin =
    this.target = this.offset = undefined;
};

module.exports = Plasma;
