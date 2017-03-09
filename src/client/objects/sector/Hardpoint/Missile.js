
var pixi = require('pixi'),
    engine = require('engine');

function Missile(parent) {
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
  this.points = {
    x: [],
    y: [],
    current: 0,
    length: 0
  };

  this.spread = {
    x: this.game.rnd.realInRange(-this.data.spread, this.data.spread),
    y: this.game.rnd.realInRange(-this.data.spread, this.data.spread),
    sin: this.game.rnd.integer(),
    cos: this.game.rnd.integer(),
    t: this.game.rnd.realInRange(0.001, 0.0025)
  }

  this.origin = new engine.Point();
  this.destination = new engine.Point();

  this.isDone = false;
  this.isRunning = false;

  this.missile = new engine.Sprite(this.game, 'texture-atlas', this.data.texture);
  this.missile.scale.set(1.0, 1.0);
  this.missile.pivot.set(32, 32);
};

Missile.prototype.start = function(destination, distance, spawn, index) {
  this.elapsed = 0;
  this.length = 0;
  this.runtime = this.duration + this.length;
  this.delay = this.data.delay;
  this.started = this.clock.time;
  this.offset = this.clock.time;

  this.isDone = false;
  this.isRunning = true;
  this.hasExploded = false;

  this.continue(this.parent.updateTransform());
  // this.continue(destination);

  this.parent.fxGroup.addChild(this.missile);
};

Missile.prototype.stop = function() {
  this.isRunning = false;
  this.parent.fxGroup.removeChild(this.missile);
};

Missile.prototype.continue = function(target) {
  // this.destination.copyFrom(target);
  this.points.x.push(target.x);
  this.points.y.push(target.y);
  this.points.length += 1;
};

Missile.prototype.explode = function() {
  if(!this.hasExploded) {
    this.isDone = true;
    this.hasExploded = true;

    this.parent.explosionEmitter.rocket();
    this.parent.explosionEmitter.at({ center: this.missile.position });
    this.parent.explosionEmitter.explode(3);
  }
};

Missile.prototype.update = function() {
  var start, length, percentage,
      points = this.points,
      missile = this.missile;

  if(this.isRunning === true) {
    this.elapsed = this.clock.time - this.started;

    length = (points.length+1)*1000;
    percentage = this.elapsed/length;

    if(this.elapsed < length) {
      x = engine.Math.bezierInterpolation(points.x, percentage);
      y = engine.Math.bezierInterpolation(points.y, percentage);

      x += global.Math.sin((this.elapsed + this.spread.sin) * this.spread.t) * this.spread.x;
      y -= global.Math.cos((this.elapsed + this.spread.cos) * this.spread.t) * this.spread.y;

      missile.rotation = global.Math.atan2(y - missile.position.y, x - missile.position.x)
      missile.position.set(x, y);
      
      this.parent.fireEmitter.missile();
      this.parent.fireEmitter.at({ center: missile.position });
      this.parent.fireEmitter.explode(1);
    } else {
      this.explode();
      this.stop();
    }
  }
};

Missile.prototype.destroy = function() {
  this.isRunning && this.stop();

  this.parent = this.game = 
    this.data = this.clock = this.destination = this.origin =
    this.target = undefined;
};

module.exports = Missile;
