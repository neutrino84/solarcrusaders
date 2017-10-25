
var pixi = require('pixi'),
    engine = require('engine');

function Pulse(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.manager = parent.manager;
  this.state = parent.manager.state;
  this.data = parent.data;
  this.clock  = parent.game.clock;

  this.started = 0;
  this.elapsed = 0;
  this.length = 0;
  this.duration = 0;

  this.spread = null;

  this.isDone = true;
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
  this.glow.position.set(6, 12);
  this.glow.tint = global.parseInt(this.data.glow);
  this.glow.blendMode = engine.BlendMode.ADD;
};

Pulse.prototype.start = function(destination, distance, spawn, index, slot, total) {
  this.elapsed = 0;
  this.length = this.data.length;
  this.duration = distance * this.data.projection;
  this.runtime = this.duration + this.length;
  this.delay = this.data.delay + (this.duration * ((index) / (spawn+1))) + (this.parent.ship.data.rate * this.game.rnd.realInRange(this.data.offset.min, this.data.offset.max) * (slot/total));
  this.started = this.clock.time + this.delay;

  this.isRunning = true;
  this.hasExploded = false;

  // reset strip alpha
  this.strip.alpha = 1.0;
  this.glow.alpha = 1.0;

  // create randomness
  this.glow.rotation = this.game.rnd.realInRange(0, global.Math.PI);
  this.scale = this.game.rnd.realInRange(1.0, 2.0);
  this.glow.scale.set(this.scale, this.scale);
  this.spread = {
    x: this.game.rnd.realInRange(-this.data.spread, this.data.spread),
    y: this.game.rnd.realInRange(-this.data.spread, this.data.spread)
  };

  this.destination.copyFrom(destination);
  this.destination.add(this.spread.x, this.spread.y)

  this.origin.copyFrom(this.parent.updateTransform());
  this._start.copyFrom(this.origin);
  this._end.copyFrom(this.origin);

  this.manager.fxGroup.addChild(this.strip);
  this.parent.sprite.addChild(this.glow);
};

Pulse.prototype.stop = function() {
  this.isRunning = false;
  this.manager.fxGroup.removeChild(this.strip);
  this.parent.sprite.removeChild(this.glow);
};

Pulse.prototype.update = function() {
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

      f1 = 1-(-this.elapsed/this.delay);

      this.glow.scale.set(this.scale * f1, this.scale * f1);
      return;
    } else {
      f3 = this.elapsed/this.runtime;

      // update glow
      this.glow.scale.set(this.scale, this.scale);
      this.glow.alpha = 1-f3;
    }

    // update orig / dest
    this.origin.copyFrom(this.parent.updateTransform());

    if(this.elapsed <= this.duration) {
      f1 = this.elapsed/this.duration;
      
      this.origin.interpolate(this.destination, f1, this._start);
    } else {
      f2 = (this.elapsed-this.duration)/this.length;
      
      this._start.copyFrom(this.destination);
      
      // fade out strip
      this.strip.alpha = 1-f2;

      // emit particles
      this.state.fireEmitter.pulse(this.data.emitter);
      this.state.fireEmitter.at({ center: this.destination });
      this.state.fireEmitter.explode(1);
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

  this.parent = this.game =
    this.data = this.clock = this.manager =
    this.destination = this.origin = undefined;
};

module.exports = Pulse;
