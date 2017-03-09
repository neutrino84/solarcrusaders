
var pixi = require('pixi'),
    engine = require('engine');

function Plasma(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.data = parent.data;
  this.ship = parent.ship;
  this.sprite = parent.sprite;
  this.clock  = parent.game.clock;

  this.started = 0;
  this.elapsed = 0;
  this.length = 0;
  this.duration = 0;

  this.isDone = false;
  this.isRunning = false;

  this.target = new engine.Point();
  this.origin = new engine.Point();
  this.destination = new engine.Point();
  this.homing = new engine.Point();

  this.plasma = new engine.Sprite(this.game, 'texture-atlas', this.data.texture);
  this.plasma.scale.set(0.5, 0.5);
  this.plasma.anchor.set(0.5, 0.5);

  this.glow = new engine.Sprite(this.game, 'texture-atlas', 'explosion-d.png');
  this.glow.scale.set(1, 1);
  this.glow.pivot.set(64, 64);
  this.glow.position.set(340, 254);
  this.glow.tint = global.parseInt(this.data.glow);
  this.glow.blendMode = engine.BlendMode.ADD;
  this.glow.alpha = 0.0;
};

Plasma.prototype.start = function(destination, distance, spawn, index) {
  this.elapsed = 0;
  this.length = this.data.length;
  this.duration = distance * this.data.projection;
  this.runtime = this.duration + this.length;
  this.delay = ((this.data.delay/spawn) * index);
  this.started = this.clock.time + this.delay;

  this.isDone = false;
  this.isRunning = true;
  this.hasExploded = false;

  this.destination.copyFrom(destination);
  this.origin.copyFrom(this.parent.updateTransform());
  this.origin.add(this.game.rnd.realInRange(-this.data.spread, this.data.spread),
    this.game.rnd.realInRange(-this.data.spread, this.data.spread))

  this.ship.addChildAt(this.glow, 4);
  this.parent.fxGroup.addChild(this.plasma);
};

Plasma.prototype.stop = function() {
  this.isRunning = false;

  this.ship.removeChild(this.glow);
  this.parent.fxGroup.removeChild(this.plasma);
};

Plasma.prototype.explode = function() {
  if(!this.hasExploded) {
    this.isDone = true;
    this.hasExploded = true;

    this.parent.shockwaveEmitter.shockwave();
    this.parent.shockwaveEmitter.at({ center: this.plasma.position });
    this.parent.shockwaveEmitter.explode(1);

    this.parent.explosionEmitter.rocket();
    this.parent.explosionEmitter.at({ center: this.plasma.position });
    this.parent.explosionEmitter.explode(2);
  }
};

Plasma.prototype.update = function() {
  var f0, f1, f2;

  if(this.isRunning === true) {
    this.elapsed = this.clock.time - this.started;

    f1 = this.elapsed/this.runtime;
    f0 = 1-f1;

    if(this.elapsed < 256) {
      this.origin.copyFrom(this.parent.updateTransform());

      this.plasma.position.x = this.origin.x;
      this.plasma.position.y = this.origin.y;
      this.plasma.rotation = this.origin.angle(this.destination);

      this.parent.fireEmitter.plasma(null, this.destination);
      this.parent.fireEmitter.at({ center: this.plasma.position });
      this.parent.fireEmitter.explode(1);
      return;
    }

    this.glow.scale.set(f0*5.0, f0*5.0);
    this.glow.alpha = f1;

    this.origin.interpolate(this.destination, engine.Easing.Quadratic.In(f1), this.target);
    
    this.plasma.alpha = f1*2;
    this.plasma.position.x = this.target.x;
    this.plasma.position.y = this.target.y;
    this.plasma.rotation = this.destination.angle(this.target);

    this.parent.fireEmitter.plasma(null, this.target);
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
