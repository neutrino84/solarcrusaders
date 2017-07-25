
var pixi = require('pixi'),
    engine = require('engine');

function Energy(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.manager = parent.manager;
  this.data = parent.data;
  this.clock  = this.game.clock;

  this.elapsed = 0;
  this.length = 0;
  this.duration = 0;
  this.started = 0;

  this.isDone = false;
  this.isRunning = false;
  this.hasExploded = false;

  this._start = new engine.Point();
  this._end = new engine.Point();

  this.random = new engine.Point();
  this.offset = new engine.Point();
  this.origin = new engine.Point();
  this.destination = new engine.Point();
  
  this.texture = new pixi.Texture(this.game.cache.getBaseTexture(this.data.texture));
  
  this.strip = new engine.Strip(this.game, this.texture, [this._start, this._end]);
  this.strip.blendMode = engine.BlendMode.ADD;

  this.glow = new engine.Sprite(this.game, 'texture-atlas', this.data.glow.sprite);
  this.glow.pivot.set(32, 32);
  this.glow.position.set(0, 16);
  this.glow.tint = global.parseInt(this.data.glow.tint);
  this.glow.blendMode = engine.BlendMode.ADD;
};

Energy.prototype.start = function(destination, distance, spawn, index) {
  this.elapsed = 0;
  this.length = this.data.length;
  this.duration = distance * this.data.projection;
  this.runtime = this.duration + this.length;
  this.delay = this.data.delay;
  this.started = this.clock.time + this.delay;

  this.ship = null;
  this.isDone = false;
  this.isRunning = true;
  this.hasExploded = false;

  this.glow.alpha = 1.0;
  this.glow.scale.set(this.data.glow.size, this.data.glow.size);
  this.glow.rotation = global.Math.PI * this.game.rnd.frac();

  this.destination.copyFrom(destination);
  this.offset.copyFrom(destination);
  this.offset.add(this.spread(), this.spread());

  this.origin.copyFrom(this.parent.updateTransform());
  this._start.copyFrom(this.origin);
  this._end.copyFrom(this.origin);

  this.manager.fxGroup.addChild(this.strip);
  this.parent.sprite.addChild(this.glow);
};

Energy.prototype.spread = function(spread) {
  var rnd = this.game.rnd,
      spread = spread || this.data.spread;
  return rnd.realInRange(-spread, spread);
};

Energy.prototype.stop = function() {
  this.isDone = true;
  this.isRunning = false;
  this.manager.fxGroup.removeChild(this.strip);
  this.parent.sprite.removeChild(this.glow);
};

Energy.prototype.continue = function(target) {
  if(this.hasExploded) { return; }

  this.started = this.clock.time - this.duration;
  this.runtime = this.duration + this.length;

  this.offset.copyFrom(target);
  this.offset.add(this.spread(), this.spread());
};

Energy.prototype.hit = function(ship, target) {
  if(this.hasExploded) { return; }

  var rnd = this.game.rnd,
      r1 = rnd.realInRange(-ship.data.size/2, ship.data.size/2),
      r2 = rnd.realInRange(-ship.data.size/2, ship.data.size/2);

  this.hasExploded = true;

  this.ship = ship;

  this.random.setTo(r1, r2);

  this.started = this.clock.time - this.duration;
  this.runtime = this.duration + this.length;
};

Energy.prototype.update = function() {
  var f1, f2, f3;

  if(this.isRunning === true) {
    this.elapsed = this.clock.time - this.started;
    
    // always glow animate rotation
    this.glow.rotation += 0.02;

    // animate glow scale at start
    if(this.elapsed < 0) {
      this.origin.copyFrom(this.parent.updateTransform());
      this._start.copyFrom(this.origin);
      this._end.copyFrom(this.origin);

      f1 = -this.elapsed/this.delay;

      this.glow.scale.set(this.data.glow.size * f1, this.data.glow.size * f1);
      this.glow.alpha = f1 * 1.0;

      return;
    }

    if(this.ship) {
      this.offset.copyFrom(this.ship.position);
      this.offset.add(this.random.x, this.random.y);
    }

    f3 = engine.Easing.Quadratic.InOut(this.elapsed/this.runtime);

    // move target
    this.destination.interpolate(this.offset, f3, this.destination);

    if(this.elapsed < this.duration) {
      f1 = this.elapsed/this.duration;
      
      this.origin.interpolate(this.destination, f1, this._start);
    } else {
      this._start.copyFrom(this.destination);

      this.manager.fireEmitter.energy(this.data.emitter);
      this.manager.fireEmitter.at({ center: this.destination });
      this.manager.fireEmitter.explode(1);
    }

    if(this.elapsed > this.length) {
      f2 = (this.elapsed-this.length)/this.duration;
      this.origin.copyFrom(this.parent.updateTransform());
      this.origin.interpolate(this.destination, f2, this._end);
    } else {
      this._end.copyFrom(this.parent.updateTransform(this.destination));
    }

    // stop once done
    if(this.elapsed >= this.runtime) {
      this.stop();
    }
  }
};

Energy.prototype.destroy = function() {
  this.isRunning && this.stop();

  this.strip.destroy();
  this.glow.destroy();

  this.parent = this.game =
    this.data = this.clock = this.manager =
    this.destination = this.origin =
    this.target = this.offset = undefined;
};

module.exports = Energy;
