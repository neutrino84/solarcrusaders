
var pixi = require('pixi'),
    engine = require('engine');

function Pulse(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.data = parent.data;
  this.ship = parent.ship;
  this.manager = parent.manager;
  this.clock  = parent.game.clock;
  this.rnd = parent.game.rnd;

  this.started = 0;
  this.length = 0;
  this.duration = 0;
  this.multiple = true;
  this.isRunning = false;

  this.p1 = new engine.Point();
  this.p2 = new engine.Point();

  this.origin = new engine.Point();
  this.destination = new engine.Point();

  this.texture = new pixi.Texture(this.game.cache.getBaseTexture(this.data.texture));
  
  this.strip = new engine.Strip(this.game, this.texture, [this.p1, this.p2]);
  this.strip.blendMode = engine.BlendMode.ADD;

  this.glow = new engine.Sprite(this.game, 'texture-atlas', 'turret-glow.png');
  this.glow.pivot.set(32, 32);
  this.glow.position.set(6, 12);
  this.glow.tint = global.parseInt(this.data.glow);
  this.glow.blendMode = engine.BlendMode.ADD;
};

Pulse.prototype.start = function(destination, distance, spawn) {
  this.length = this.data.length;
  this.duration = distance*this.data.projection;
  this.offset = this.parent.ship.data.rate*this.parent.slot/this.parent.total;
  this.delay = this.data.delay + this.rnd.realInRange(this.offset/2, this.offset) + (spawn * this.duration);
  this.started = this.clock.time + this.delay;

  // running
  this.isRunning = true;

  // reset alpha
  this.glow.alpha = 0.0;
  this.strip.alpha = 1.0;

  // create randomness
  this.scale = this.rnd.realInRange(1.0, 3.0);
  this.glow.scale.set(this.scale, this.scale);
  this.glow.rotation = this.rnd.realInRange(0, global.Math.PI);

  // update origin
  this.parent.updateTransform(this.origin, this.destination);

  // update destination
  this.destination.set(destination.x, destination.y);
  this.destination.add(
    this.rnd.realInRange(-this.data.spread, this.data.spread),
    this.rnd.realInRange(-this.data.spread, this.data.spread));

  this.p1.copyFrom(this.origin);
  this.p2.copyFrom(this.origin);

  this.parent.sprite.addChild(this.glow);
  this.manager.fxGroup.addChild(this.strip);
};

Pulse.prototype.stop = function() {
  this.isRunning = false;
  this.parent.sprite.removeChild(this.glow);
  this.manager.fxGroup.removeChild(this.strip);
};

Pulse.prototype.update = function() {
  var f1, f2, f3,
      game = this.game,
      parent = this.parent,
      origin = this.origin,
      destination = this.destination,
      glow = this.glow,
      strip = this.strip,
      elapsed = this.clock.time-this.started,
      p1 = this.p1,
      p2 = this.p2;

  if(this.isRunning === true) {
    // update orig / dest
    parent.updateTransform(origin, destination);

    // always glow animate rotation
    glow.rotation += 0.02;

    // animate glow scale at start
    if(elapsed < 0) {
      // copy points
      p1.set(origin.x, origin.y);
      p2.set(origin.x, origin.y);
      
      // charge glow effect
      f1 = 1-(-elapsed/this.delay);
      glow.alpha = f1;
    } else {
      if(elapsed < this.duration-this.length) {
        f1 = elapsed/(this.duration-this.length);
        origin.interpolate(destination, f1, p1);
      } else {
        p1.copyFrom(destination);

        // emit particles
        for(var i=0; i<2; i++) {
          game.emitters.fire.pulse(this.data.emitter);
          game.emitters.fire.at({ center: destination });
          game.emitters.fire.explode(1);
        }
      }

      if(elapsed > this.length) {
        f2 = (elapsed-this.length)/this.duration;
        origin.interpolate(destination, f2, p2);
      } else {
        p2.copyFrom(origin);
      }

      // stop once stop
      if(elapsed > this.duration) {
        this.stop();
      }
    }
  }
};

Pulse.prototype.destroy = function() {
  this.isRunning && this.stop();

  this.strip.destroy();
  this.glow.destroy();

  this.parent = this.game =
    this.data = this.clock = this.manager =
    this.texture = undefined;
};

module.exports = Pulse;
