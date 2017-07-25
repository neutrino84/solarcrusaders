
var pixi = require('pixi'),
    engine = require('engine');

function Plasma(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.manager = parent.manager;
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

  this.isDone = true;
  this.isRunning = false;
  this.hasExploded = false;

  this.target = new engine.Point();
  this.origin = new engine.Point();
  this.destination = new engine.Point();
  this.emitter = new engine.Point();

  this.plasma = new engine.Sprite(this.game, 'texture-atlas', this.data.texture);
  this.plasma.scale.set(0.0, 0.0);
  this.plasma.pivot.set(32, 32);
  this.plasma.blendMode = engine.BlendMode.ADD;

  this.parent.cap.tint = 0xFF9999;
};

Plasma.prototype.start = function(destination, distance, spawn, index) {
  this.elapsed = 0;
  this.length = this.data.length;
  this.duration = distance * this.data.projection + (index * this.data.delay);
  this.delay = this.data.delay;
  this.runtime = this.duration;
  this.started = this.clock.time + this.delay;

  this.isRunning = true;
  this.hasExploded = false;

  this.plasma.alpha = 0;
  this.plasma.scale.set(1, 1);

  this.origin.copyFrom(this.parent.updateTransform());
  this.destination.copyFrom(destination);
  this.destination.add(this.spread.x, this.spread.y);

  this.manager.fxGroup.addChild(this.plasma);
};

Plasma.prototype.stop = function() {
  this.isRunning = false;

  this.manager.fxGroup.removeChild(this.plasma);
};

Plasma.prototype.explode = function() {
  if(!this.hasExploded) {
    this.hasExploded = true;

    this.manager.fireEmitter.plasma(this.data.emitter);
    this.manager.fireEmitter.at({ center: this.plasma.position });
    this.manager.fireEmitter.explode(2);
  }
};

Plasma.prototype.update = function() {
  var f1, f2, wobble,
      rnd = this.game.rnd;

  if(this.isRunning === true) {
    this.elapsed = this.clock.time - this.started;
    this.origin.copyFrom(this.parent.updateTransform());

    if(this.elapsed < 0) {
      f2 = 1-(-this.elapsed/this.delay);

      this.plasma.alpha = f2;
      this.plasma.position.x = this.origin.x;
      this.plasma.position.y = this.origin.y;
      this.plasma.rotation = this.parent.rotation;
      return;
    }

    f1 = this.elapsed/this.runtime;
    wobble = rnd.frac() * this.length;

    this.origin.interpolate(this.destination, f1, this.target);

    this.plasma.position.x = this.target.x;
    this.plasma.position.y = this.target.y;
    this.plasma.rotation = this.destination.angle(this.target);
    this.plasma.scale.set(f1+1+wobble, f1+1+wobble);

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

  this.parent = this.game = this.manager =
    this.data = this.clock = this._start =
    this._end = this.destination = this.origin =
    this.target = this.offset = undefined;
};

module.exports = Plasma;
