
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

  this.origin = new engine.Point();
  this.destination = new engine.Point();
  this.pointAtDistance = new engine.Point();

  this.isDone = false;
  this.isRunning = false;

  this.missile = new engine.Sprite(this.game, 'texture-atlas', this.data.texture);
  this.missile.scale.set(1.0, 1.0);
  this.missile.pivot.set(32, 32);
};

Missile.prototype.start = function(destination, distance, spawn, index) {
  this.elapsed = 0;
  this.length = this.data.length;
  this.duration = distance * this.data.projection;
  this.runtime = this.duration + this.length;
  this.delay = this.data.delay;
  this.started = this.clock.time + this.delay;

  this.isDone = false;
  this.isRunning = true;
  this.hasExploded = false;

  this.add(this.parent.updateTransform());
  this.destination.copyFrom(destination);

  this.parent.fxGroup.addChild(this.missile);
};

Missile.prototype.add = function(target) {
  this.points.length += 1;
  this.points.x.push(target.x);
  this.points.y.push(target.y);
};

Missile.prototype.stop = function() {
  this.isRunning = false;
  this.parent.fxGroup.removeChild(this.missile);
};

Missile.prototype.continue = function(target) {
  var speed = 50,
      points = this.points,
      i = points.length-1,
      start = { x: points.x[i], y: points.y[i] };
  this.destination.copyFrom(target);
  this.pointAtDistance = engine.Line.pointAtDistance(start, this.destination, speed, this.pointAtDistance);
  this.add(this.pointAtDistance);
};

Missile.prototype.explode = function() {
  if(!this.hasExploded) {
    // this.isDone = true;
    this.hasExploded = true;

    this.parent.explosionEmitter.rocket();
    this.parent.explosionEmitter.at({ center: this.missile.position });
    this.parent.explosionEmitter.explode(1);
  }
};

Missile.prototype.update = function() {
  var speed = 50,
      start, i, x, y, position,
      points = this.points;

  if(this.isRunning === true) {
    this.elapsed = this.clock.time - this.started;

    i = points.length-1,
    start = { x: points.x[i], y: points.y[i] };

    if(this.destination.distance(this.missile.position) <= speed * 2) {
      this.pointAtDistance = engine.Line.pointAtDistance(start, this.destination, speed, this.pointAtDistance);
      this.add(this.pointAtDistance);
    }

    position = points.current/points.length;

    x = engine.Math.bezierInterpolation(points.x, position);
    y = engine.Math.bezierInterpolation(points.y, position);

    if(x && y) {
      this.missile.position.set(x, y);
      this.missile.rotation = this.destination.angle({ x: x, y: y });
    }

    // if(this.elapsed > this.runtime) {
    //   this.explode();
    //   this.stop();
    // }
  }
};

Missile.prototype.destroy = function() {
  this.isRunning && this.stop();

  this.parent = this.game = 
    this.data = this.clock = this.destination = this.origin =
    this.target = undefined;
};

module.exports = Missile;
