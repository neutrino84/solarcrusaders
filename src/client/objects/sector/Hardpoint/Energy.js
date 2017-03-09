
var pixi = require('pixi'),
    engine = require('engine');

function Energy(hardpoint) {
  this.hardpoint = hardpoint;
  this.game = hardpoint.game;
  this.data = hardpoint.data;
  this.clock  = this.game.clock;

  this.started = 0;
  this.elapsed = 0;
  this.length = 0;
  this.duration = 0;

  this.isDone = false;
  this.isRunning = false;

  this._start = new engine.Point();
  this._end = new engine.Point();

  this.origin = new engine.Point();
  this.destination = new engine.Point();
  this.offset = new engine.Point();
  
  this.texture = new pixi.Texture(this.game.cache.getBaseTexture(this.data.texture));
  
  this.strip = new engine.Strip(this.game, this.texture, [this._start, this._end]);
  this.strip.blendMode = engine.BlendMode.ADD;

  this.glow = new engine.Sprite(this.game, 'texture-atlas', this.data.glow.sprite);
  this.glow.scale.set(this.data.glow.size, this.data.glow.size);
  this.glow.pivot.set(32, 32);
  this.glow.position.set(0, 16);
  this.glow.rotation = global.Math.PI * global.Math.random();
  this.glow.tint = global.parseInt(this.data.glow.tint);
  this.glow.blendMode = engine.BlendMode.ADD;
};

Energy.prototype.start = function(destination, distance, spawn, index) {
  this.elapsed = 0;
  this.length = this.data.length;
  this.duration = distance * this.data.projection;
  this.runtime = this.duration + this.length/3;
  this.delay = this.data.delay;
  this.started = this.clock.time + this.delay;

  this.isDone = false;
  this.isRunning = true;
  this.hasExploded = false;

  this.destination.copyFrom(destination);
  this.offset.copyFrom(destination);
  this.offset.add(this.spread(), this.spread());

  this.origin.copyFrom(this.hardpoint.updateTransform());
  this._start.copyFrom(this.origin);
  this._end.copyFrom(this.origin);

  this.hardpoint.fxGroup.addChild(this.strip);
  this.hardpoint.sprite.addChild(this.glow);
};

Energy.prototype.spread = function(spread) {
  var rnd = this.game.rnd,
      spread = spread || this.data.spread;
  return rnd.realInRange(-spread, spread);
};

Energy.prototype.stop = function() {
  this.isRunning = false;
  this.hardpoint.fxGroup.removeChild(this.strip);
  this.hardpoint.sprite.removeChild(this.glow);
};

Energy.prototype.continue = function(target) {
  if(this.hasExploded) { return; }

  this.started = this.clock.time - this.duration - this.delay;
  this.runtime = this.duration + this.length;

  this.offset.copyFrom(target);
  this.offset.add(this.spread(), this.spread());
};

Energy.prototype.hit = function(ship, target) {
  if(this.hasExploded) { return; }

  this.length = this.length;

  this.started = this.clock.time - this.duration - this.delay;
  this.runtime = this.duration + this.length/2;

  this.ship = ship;

  this.hasExploded = true;
};

Energy.prototype.update = function() {
  var f1, f2, f3, sin, cos,
      rnd = this.game.rnd;

  if(this.isRunning === true) {
    this.elapsed = this.clock.time - this.started;
    
    // always glow animate rotation
    this.glow.rotation += 0.02;

    // animate glow scale at start
    if(this.elapsed < 0) {
      this.origin.copyFrom(this.hardpoint.updateTransform());
      this._start.copyFrom(this.origin);
      this._end.copyFrom(this.origin);

      f1 = 1-(-this.elapsed/this.delay);

      this.glow.scale.set(this.data.glow.size * f1, this.data.glow.size * f1);
      this.glow.alpha = f1 * 1.0;
      return;
    } else {
      this.glow.scale.set(this.data.glow.size, this.data.glow.size);
      this.glow.alpha = 1.0;
    }

    // stop once done
    if(this.elapsed >= this.runtime) {
      this.isDone = true;
      this.stop();
    }

    f3 = this.elapsed/this.runtime;

    if(this.ship) {
      this.offset.copyFrom(this.ship.position);
    }

    // move target
    this.destination.interpolate(this.offset, f3, this.destination);

    if(this.elapsed < this.duration) {
      f1 = this.elapsed/this.duration;
      
      this.origin.interpolate(this.destination, f1, this._start);
    } else {
      this._start.copyFrom(this.destination);

      this.hardpoint.fireEmitter.energy(this.data.emitter);
      this.hardpoint.fireEmitter.at({ center: this.destination });
      this.hardpoint.fireEmitter.explode(3);
    }

    if(this.elapsed >= this.length) {
      f2 = (this.elapsed-this.length)/this.duration;
      this.origin.copyFrom(this.hardpoint.updateTransform());
      this.origin.interpolate(this.destination, f2, this._end);
    } else {
      this._end.copyFrom(this.hardpoint.updateTransform(this.destination));
    }
  }
};

Energy.prototype.destroy = function() {
  this.isRunning && this.stop();

  this.strip.destroy();
  this.glow.destroy();

  this.hardpoint = this.game = 
    this.data = this.clock =
    this.destination = this.origin =
    this.target = this.offset = undefined;
};

module.exports = Energy;
