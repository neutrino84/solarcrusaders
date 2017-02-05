
var pixi = require('pixi'),
    engine = require('engine');

function Pulse(parent) {
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

  this._start = new engine.Point();
  this._end = new engine.Point();

  this.target = new engine.Point();
  this.origin = new engine.Point();
  this.destination = new engine.Point();
  this.offset = new engine.Point(this.spread.x, this.spread.y);
  
  this.texture = new pixi.Texture(this.game.cache.getBaseTexture(this.data.texture));
  
  this.strip = new engine.Strip(this.game, this.texture, [this._start, this._end]);
  this.strip.blendMode = engine.BlendMode.ADD;

  this.scale = global.Math.random() + 1.0;
  this.glow = new engine.Sprite(this.game, 'texture-atlas', 'turret-glow.png');
  this.glow.scale.set(0.0, 0.0);
  this.glow.pivot.set(32, 32);
  this.glow.position.set(0, 16);
  this.glow.rotation = global.Math.PI * global.Math.random();
};

Pulse.prototype.start = function(destination, duration, delay) {
  this.elapsed = 0;
  this.duration = duration * this.data.projection;
  this.delay = delay;
  this.started = this.clock.time + delay;

  this.isDone = false;
  this.isRunning = true;
  this.hasExploded = false;

  this.length = this.data.length;
  this.runtime = this.duration + this.length;

  // this.origin.copyFrom(origin);
  this.target.copyFrom(destination);
  this.destination.copyFrom(destination);

  // this._start.copyFrom(this.origin);
  // this._end.copyFrom(this.origin);

  this.glow.alpha = 1.0;

  this.parent.fxGroup.addChild(this.strip);
  this.parent.sprite.addChild(this.glow);
};

Pulse.prototype.stop = function() {
  this.isRunning = false;
  this.parent.fxGroup.removeChild(this.strip);
  this.parent.sprite.removeChild(this.glow);
};

Pulse.prototype.explode = function() {
  if(this.data.name === 'Hydra Pulse Cannon') {
    this.parent.explosionEmitter.at({ center: this.destination });
    this.parent.explosionEmitter.explode(1);

    this.parent.glowEmitter.at({ center: this.destination });
    this.parent.glowEmitter.explode(1);
  } else {
    this.parent.fireEmitter.at({ center: this.destination });
    this.parent.fireEmitter.explode(1);
  }

  if(!this.hasExploded) {
    this.parent.explode(this.destination);
  }

  this.hasExploded = true;
};

Pulse.prototype.update = function() {
  var f1, f2, f3;

  if(this.isRunning === true) {
    this.elapsed = this.clock.time - this.started;
    this.glow.rotation += 0.02;

    if(this.elapsed < 0) {
      f1 = 1-(-this.elapsed/this.delay);
      this.glow.scale.set(this.scale * f1, this.scale * f1);
      return;
    } else {
      this.glow.scale.set(this.scale, this.scale);
    }

    if(this.elapsed >= this.runtime) {
      this.stop();
    }

    f3 = this.elapsed/this.runtime;

    this.destination.x = this.target.x + (this.offset.x * f3);
    this.destination.y = this.target.y + (this.offset.y * f3);

    // update orig / dest
    this.origin.copyFrom(this.parent.updateTransform(this.destination));

    if(this.elapsed <= this.duration) {
      f1 = this.elapsed/this.duration;
      
      this.origin.interpolate(this.destination, f1, this._start);
    } else {
      f2 = (this.elapsed-this.duration)/this.length;
      
      this._start.copyFrom(this.destination);
      
      this.strip.alpha = 1-f2;
      this.explode();
    }

    if(this.elapsed >= this.length) {
      f2 = (this.elapsed-this.length)/this.duration;
      this.origin.interpolate(this.destination, f2, this._end);
      this.glow.alpha = 1-f2;
      this.isDone = true;
    } else {
      this._end.copyFrom(this.origin);
    }
  }
};

Pulse.prototype.destroy = function() {
  this.isRunning && this.stop();

  this.strip.destroy();
  this.glow.destroy();

  this.parent = this.game = 
    this.data = this.clock = this._start =
    this._end = this.destination = this.origin =
    this.target = this.offset = undefined;
};

module.exports = Pulse;
