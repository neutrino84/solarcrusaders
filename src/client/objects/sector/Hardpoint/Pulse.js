
var pixi = require('pixi'),
    engine = require('engine');

function Pulse(hardpoint) {
  this.hardpoint = hardpoint;
  this.game = hardpoint.game;
  this.data = hardpoint.data;
  this.clock  = this.game.clock;

  this.started = 0;
  this.elapsed = 0;
  this.length = 0;
  this.duration = 0;

  this.spread = null;

  this.isDone = false;
  this.isRunning = false;
  this.hasExploded = false;

  this._start = new engine.Point();
  this._end = new engine.Point();

  this.origin = new engine.Point();
  this.destination = new engine.Point();
  
  this.texture = new pixi.Texture(this.game.cache.getBaseTexture(this.data.texture));
  
  this.strip = new engine.Strip(this.game, this.texture, [this._start, this._end]);
  this.strip.blendMode = engine.BlendMode.ADD;

  this.glow = new engine.Sprite(this.game, 'texture-atlas', 'turret-glow.png');
  this.glow.pivot.set(32, 32);
  this.glow.position.set(0, 16);
  this.glow.tint = global.parseInt(this.data.glow);
  this.glow.blendMode = engine.BlendMode.ADD;
};

Pulse.prototype.start = function(destination, distance, spawn, index, slot) {
  this.elapsed = 0;
  this.length = this.data.length;
  this.duration = distance * this.data.projection;
  this.runtime = this.duration + this.length;
  this.delay = this.data.delay + (this.runtime * ((index+1) / (spawn+1))) + (slot * 64 * this.game.rnd.frac());
  this.started = this.clock.time + this.delay;

  this.isDone = false;
  this.isRunning = true;
  this.hasExploded = false;

  // create randomness
  this.strip.alpha = 1;
  this.glow.rotation = this.game.rnd.realInRange(0, global.Math.PI);
  this.scale = this.game.rnd.realInRange(1, 2);
  this.glow.scale.set(this.scale, this.scale);
  this.spread = {
    x: this.game.rnd.realInRange(-this.data.spread, this.data.spread),
    y: this.game.rnd.realInRange(-this.data.spread, this.data.spread)
  };

  this.destination.copyFrom(destination);
  this.destination.add(this.spread.x, this.spread.y)

  this.origin.copyFrom(this.hardpoint.updateTransform());
  this._start.copyFrom(this.origin);
  this._end.copyFrom(this.origin);

  this.hardpoint.fxGroup.addChild(this.strip);
  this.hardpoint.sprite.addChild(this.glow);
};

Pulse.prototype.stop = function() {
  this.isRunning = false;
  this.isDone = true;
  this.hardpoint.fxGroup.removeChild(this.strip);
  this.hardpoint.sprite.removeChild(this.glow);
};

Pulse.prototype.update = function() {
  var f1, f2, f3;

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

      this.glow.scale.set(this.scale * f1, this.scale * f1);
      this.glow.alpha = f1 * 1.0;
      return;
    } else {
      this.glow.scale.set(this.scale, this.scale);
      this.glow.alpha = 1.0;
    }

    f3 = this.elapsed/this.runtime;

    // update glow
    this.glow.alpha = 1-f3;

    // update orig / dest
    this.origin.copyFrom(this.hardpoint.updateTransform());

    if(this.elapsed <= this.duration) {
      f1 = this.elapsed/this.duration;
      
      this.origin.interpolate(this.destination, f1, this._start);
    } else {
      f2 = (this.elapsed-this.duration)/this.length;
      
      this._start.copyFrom(this.destination);
      
      // fade out strip
      this.strip.alpha = 1-f2;

      // create hole
      this.hardpoint.fireEmitter.pulse(this.data.emitter);
      this.hardpoint.fireEmitter.at({ center: this.destination });
      this.hardpoint.fireEmitter.explode(1);
    }

    if(this.elapsed >= this.length) {
      f2 = (this.elapsed-this.length)/this.duration;
      this.origin.interpolate(this.destination, f2, this._end);
    } else {
      this._end.copyFrom(this.origin);
    }

     // stop once done
    if(this.elapsed >= this.runtime) {
      this.stop();
    }
  }
};

Pulse.prototype.destroy = function() {
  this.isRunning && this.stop();

  this.strip.destroy();
  this.glow.destroy();

  this.hardpoint = this.game = 
    this.data = this.clock = 
    this.destination = this.origin =
    this.target = undefined;
};

module.exports = Pulse;
