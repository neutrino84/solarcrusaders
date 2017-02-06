
var pixi = require('pixi'),
    engine = require('engine');

function Energy(parent) {
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

  this.scale = global.Math.random() + 1.5;
  this.glow = new engine.Sprite(this.game, 'texture-atlas', 'turret-glow.png');
  this.glow.scale.set(0.0, 0.0);
  this.glow.pivot.set(32, 32);
  this.glow.position.set(0, 16);
  this.glow.rotation = global.Math.PI * global.Math.random();
};

Energy.prototype.start = function(destination, duration, delay) {
  this.elapsed = 0;
  this.duration = duration * this.data.projection;
  this.delay = delay;
  this.started = this.clock.time + this.delay;

  this.isRunning = true;
  this.hasExploded = false;

  this.length = this.data.length;
  this.runtime = this.duration + this.length;

  this.target.copyFrom(destination);
  this.destination.copyFrom(destination);

  this.glow.alpha = 1.0;

  this.parent.fxGroup.addChild(this.strip);
  this.parent.sprite.addChild(this.glow);
};

Energy.prototype.stop = function() {
  this.isRunning = false;
  this.parent.fxGroup.removeChild(this.strip);
  this.parent.sprite.removeChild(this.glow);
};

Energy.prototype.explode = function() {
  this.parent.fireEmitter.color(this.data.emitter);
  this.parent.fireEmitter.at({ center: this.destination });
  this.parent.fireEmitter.explode(1);

  if(!this.hasExploded) {
    this.parent.explode(this.destination);
  }

  this.hasExploded = true;
};

Energy.prototype.hit = function(ship) {
  if(this.isRunning == true && !this.moving) {
    this.moving = ship.position;
    this.move = this.clock.time;
  }
};

Energy.prototype.update = function(origin) {
  var f1, f2, f3, f4,
      sin = 1.0;

  if(this.isRunning === true) {
    this.elapsed = this.clock.time - this.started;
    this.glow.rotation += 0.01;

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

    if(this.moving) {
      sin = global.Math.sin(this.elapsed * 0.005);
      f4 = (this.clock.time - this.move) / this.runtime;
      this.target.interpolate(this.moving, f4, this.target);
    }

    this.destination.x = this.target.x + (this.offset.x * sin);
    this.destination.y = this.target.y + (this.offset.y * sin);

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

Energy.prototype.destroy = function() {
  this.isRunning && this.stop();

  this.texture.destroy();
  this.strip.destroy();
  this.glow.destroy();

  this.parent = this.game = 
    this.data = this.clock = this._start =
    this._end = this.destination = this.origin =
    this.target = this.offset = undefined;
};

module.exports = Energy;
