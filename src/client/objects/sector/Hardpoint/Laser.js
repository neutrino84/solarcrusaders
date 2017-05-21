
var pixi = require('pixi'),
    engine = require('engine');

function Laser(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.data = parent.data;
  this.clock  = parent.game.clock;

  this.started = 0;
  this.elapsed = 0;

  this.delay = Laser.DEFAULT_DELAY;
  this.duration = Laser.DEFAULT_DURATION;

  this.isRunning = false;
  this.hasExploded = false;

  this._start = new engine.Point();
  this._end = new engine.Point();

  this.destination = new engine.Point();
  this.origin = new engine.Point();

  this.textureRed = new pixi.Texture(this.game.cache.getImage('laser-red', true).base);
  this.textureBlue = new pixi.Texture(this.game.cache.getImage('laser-blue', true).base);
  
  this.strip = new engine.Strip(this.game, this.textureRed, [this._start, this._end]);
  this.strip.blendMode = engine.BlendMode.ADD;

  this.glow = new engine.Sprite(this.game, 'texture-atlas', 'laser-piercing.png');
  this.glow.scale.set(1.0, 1.0);
  this.glow.pivot.set(32, 32);
  this.glow.position.set(0, 16);
  this.glow.blendMode = engine.BlendMode.ADD;
};

Laser.DEFAULT_DELAY = 50;
Laser.DEFAULT_DURATION = 400;

Laser.prototype.start = function(origin, destination, distance) {
  if(this.isRunning) { return; }
  
  this.started = this.clock.time;
  this.elapsed = 0;

  this.duration = distance/4;
  this.isRunning = true;
  this.hasExploded = false;

  // check piercing
  if(this.parent.parent.enhanced('piercing')) {
    this.delay = Laser.DEFAULT_DELAY/2;
    this.strip.texture = this.textureBlue;
  } else {
    this.delay = Laser.DEFAULT_DELAY;
    this.strip.texture = this.textureRed;
  }

  this.origin.copyFrom(origin);
  this.destination.copyFrom(destination);

  this._start.copyFrom(this.origin);
  this._end.copyFrom(this.origin);

  this.glow.alpha = 1.0;

  this.parent.fxGroup.addChild(this.strip);
  this.parent.sprite.addChild(this.glow);
};

Laser.prototype.stop = function() {
  this.isRunning = false;
  this.parent.fxGroup.removeChild(this.strip);
  this.parent.sprite.removeChild(this.glow);
};

Laser.prototype.explode = function() {
  this.hasExploded = true;

  this.parent.fireEmitter.at({ center: this.destination });
  this.parent.fireEmitter.explode(2);

  this.parent.explode(this.destination);
};

Laser.prototype.update = function(origin, destination) {
  var f1, f2, f3;
  if(this.isRunning === true) {
    this.elapsed = this.clock.time - this.started;

    if(this.elapsed >= this.duration + this.delay) {
      this.stop();
    }

    // update orig / dest
    this.origin.copyFrom(origin);

    if(this.elapsed <= this.duration) {
      f1 = this.elapsed/this.duration;
      this.origin.interpolate(this.destination, f1, this._start);
    } else {
      this._start.copyFrom(this.destination);
      
      if(this.hasExploded == false) {
        this.explode();
      }
    }

    if(this.elapsed >= this.delay) {
      f2 = (this.elapsed-this.delay)/this.duration;
      this.origin.interpolate(this.destination, f2, this._end);
      this.glow.alpha = 1.0-f2;
    } else {
      this._end.copyFrom(this.origin);
    }

    this.glow.rotation += 0.1;
  }
};

Laser.prototype.destroy = function() {
  this.stop();

  this.textureRed.destroy();
  this.textureBlue.destroy();

  this.strip.destroy();
  this.glow.destroy();

  this.parent = this.game = 
  this.data = this.clock = undefined;
};

module.exports = Laser;
