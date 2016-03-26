
var engine = require('engine'),
    Animation = require('./Animation'),
    ArcPath = require('./interpolation/ArcPath'),
    LinearPath = require('./interpolation/LinearPath'),
    EventEmitter = require('eventemitter3');

function Movement(parent) {
  this.parent = parent;

  this.game = parent.game;
  this.config = parent.config;
  this.throttle = parent.throttle;

  this.valid = true;
  this.anticlockwise = false;

  this.destination = new engine.Point();
  this.animation = new Animation(parent.game, parent);

  this._tempPoint = new engine.Point();

  EventEmitter.call(this);
}

Movement.FRAMERATE = 60;
Movement.SPEED_CONSTANT = 30.0;

Movement.prototype = Object.create(EventEmitter.prototype);
Movement.prototype.constructor = Movement;

Movement.prototype.reset = function() {
  this._linearSpeed = null;
  this._arcSpeed = null;
};

Movement.prototype.update = function() {
  var parent = this.parent,
      animation = this.animation,
      lastFrame = this.lastFrame = parent.position.clone(this._tempPoint),
      a1, a2;

  this.animation.update();

  if(animation.isPlaying && lastFrame) {
    a1 = lastFrame.y - parent.position.y;
    a2 = lastFrame.x - parent.position.x;
    if(a1 !== 0 && a2 !== 0) {
      parent.rotation = global.Math.atan2(a1, a2);
    } else {
      parent.rotation = 0;
    }
  }
};

Movement.prototype.plot = function(destination, current, previous, delay) {
  var start = current ? current : this.current,
      end = previous ? previous : this.previous,
      destination = destination || this.destination,
      oribital = this._findTangentCircle(start, end, destination);

  if(oribital) {
    this.valid = true;

    this.oribital = oribital;

    this.currentPosition = start;
    this.previousPosition = end;
    this.destination.copyFrom(destination);

    this.tangentPoint = this._findTangentPoint(this.destination, this.oribital);
    this.startAngle = this.oribital.circumferenceAngle(this.currentPosition);
    this.endAngle = this.oribital.circumferenceAngle(this.tangentPoint);

    this.arcLength = this._findArcLength(this.currentPosition, this.tangentPoint, this.oribital);
    this.linearLength = this.tangentPoint.distance(this.destination);

    this.animation.stop(true);
    this.animation.play(delay || 0, [
      new ArcPath(this, 0.0, 1.0),
      new LinearPath(this, 0.0, 0.5),
      new LinearPath(this, 0.5, 1.0, engine.Easing.Quadratic.Out)
    ]);
  } else {
    this.valid = false;
  }
};

Movement.prototype.destroy = function() {
  // this.animation.stop();
  this.animation.destroy();
  this.removeAllListeners();
  this.parent = this.game =
    this.config = this.destination =
    this.animation = this.currentPosition =
    this.previousPosition = this.oribital =
    this.tangentPoint = undefined;
};

Movement.prototype.drawDebug = function() {
  if(!this.parent.isPlayer || !this.parent.manager.trajectoryGraphics) { return; }

  // draw line from start to destination
  // this.parent.manager.trajectoryGraphics.lineStyle(1.0, 0x6699FF, 1.0);
  // this.parent.manager.trajectoryGraphics.moveTo(this.currentPosition.x, this.currentPosition.y);
  // this.parent.manager.trajectoryGraphics.lineTo(this.previousPosition.x, this.previousPosition.y);

  // draw start circle
  // this.parent.manager.trajectoryGraphics.lineStyle(1.0, 0xFFFFFF, 0.25);
  // this.parent.manager.trajectoryGraphics.beginFill(0x000000, 1.0)
  // this.parent.manager.trajectoryGraphics.drawCircle(this.currentPosition.x, this.currentPosition.y, 5);
  // this.parent.manager.trajectoryGraphics.endFill();

  // draw destination circle
  this.parent.manager.trajectoryGraphics.lineStyle(0);
  this.parent.manager.trajectoryGraphics.beginFill(0x00FFFF, 0.5);
  this.parent.manager.trajectoryGraphics.drawCircle(this.destination.x, this.destination.y, 10);
  this.parent.manager.trajectoryGraphics.endFill();

  // draw turning oribit
  // this.parent.manager.trajectoryGraphics.lineStyle(1.0, 0xFFFFFF, 0.1);
  // this.parent.manager.trajectoryGraphics.drawCircle(this.oribital.x, this.oribital.y, this.oribital.radius);
  this.parent.manager.trajectoryGraphics.lineStyle(5.0, 0x00FFFF, 0.5);
  this.parent.manager.trajectoryGraphics.arc(this.oribital.x, this.oribital.y, this.oribital.radius, this.startAngle, this.endAngle, this.anticlockwise);
  this.parent.manager.trajectoryGraphics.moveTo(this.tangentPoint.x, this.tangentPoint.y);
  this.parent.manager.trajectoryGraphics.lineTo(this.destination.x, this.destination.y);

  // draw tangent lines to destination
  // this.parent.manager.trajectoryGraphics.lineStyle(1.0, 0xFFFFFF, 0.5);
  // this.parent.manager.trajectoryGraphics.moveTo(this.destination.x, this.destination.y);
  // this.parent.manager.trajectoryGraphics.lineTo(this.tangentPoint.x, this.tangentPoint.y);
};

Movement.prototype._findTangentCircle = function(start, end, destination) {
  var radius = this.config.oribit.radius,
      p = new engine.Point(),
      perp = p.copyFrom(end).rotate(start.x, start.y, -global.Math.PI / 2),
      point1 = engine.Line.pointAtDistance(start, perp, radius),
      point2 = engine.Line.pointAtDistance(start, perp, -radius),
      len1 = point1.distance(destination),
      len2 = point2.distance(destination),
      circle1 = new engine.Circle(point1.x, point1.y, radius)
      circle2 = new engine.Circle(point2.x, point2.y, radius);
  if(len1 > len2 && !circle2.contains(destination.x, destination.y)) {
    this.anticlockwise = true;
    return circle2;
  }
  if(len1 < len2 && !circle1.contains(destination.x, destination.y)) {
    this.anticlockwise = false;
    return circle1;
  }
  return false;
};

Movement.prototype._findTangentPoint = function(point, circle) {
  // find tangents
  var t, p = new engine.Point(),
      dx = circle.x - point.x,
      dy = circle.y - point.y,
      dd = global.Math.sqrt(dx * dx + dy * dy),
      a = global.Math.asin(circle.radius / dd),
      b = global.Math.atan2(dy, dx);
  if(this.anticlockwise) {
    t = b - a;
    p.setTo(
      circle.x + circle.radius * global.Math.sin(t),
      circle.y + circle.radius * -global.Math.cos(t)
    );
  } else {
    t = b + a;
    p.setTo(
      circle.x + circle.radius * -global.Math.sin(t),
      circle.y + circle.radius * global.Math.cos(t)
    );
  }
  return p;
};

Movement.prototype._findArcLength = function(a, b, circle) { // function(a1, a2, circle) {
  var a1 = a.y - circle.y,
      a2 = a.x - circle.x,
      b1 = b.y - circle.y,
      b2 = b.x - circle.x,
      angle = global.Math.atan2(a1, a2) - global.Math.atan2(b1, b2);
  if(angle < 0) {
    angle += 2 * global.Math.PI;
  }
  if(!this.anticlockwise) {
    angle = 2 * global.Math.PI - angle;
  }
  return angle * circle.radius;
};

Movement.prototype._generatePreviousPosition = function() {
  var rotation = this.parent.rotation,
      start = this.current;
  return new engine.Point(
    start.x + (1 * global.Math.cos(rotation)),
    start.y + (1 * global.Math.sin(rotation)));
};

Object.defineProperty(Movement.prototype, 'current', {
  get: function() {
    var current,
        currentFrame = this.animation.currentFrame;
    if(!currentFrame) {
      current = this.parent.position.clone();
      currentFrame = { x: current.x, y: current.y };
    }
    return currentFrame;
  }
});

Object.defineProperty(Movement.prototype, 'previous', {
  get: function() {
    var previous,
        previousFrame = this.animation.lastFrame;
    if(!previousFrame) {
      previous = this._generatePreviousPosition();
      previousFrame = { x: previous.x, y: previous.y };
    }
    return previousFrame;
  }
});

Object.defineProperty(Movement.prototype, 'throttle', {
  get: function() {
    return this._throttle;
  },

  set: function(value) {
    this._linearSpeed = null;
    this._arcSpeed = null;
    this._throttle = value;
    this._linearSpeed = this.linearSpeed;
    this._arcSpeed = this.arcSpeed;
  }
});

Object.defineProperty(Movement.prototype, 'linearSpeed', {
  get: function() {
    return this._linearSpeed || (this._throttle * (Movement.SPEED_CONSTANT / this.parent.speed));
  }
});

Object.defineProperty(Movement.prototype, 'arcSpeed', {
  get: function() {
    return this._arcSpeed || (this.config.oribit.radius / this.linearSpeed);
  }
});

Object.defineProperty(Movement.prototype, 'maxSpeed', {
  get: function() {
    if(this._maxSpeed) {
      return this._maxSpeed;
    }
    return this._maxSpeed = 1 / (Movement.SPEED_CONSTANT / this.config.stats.speed);
  }
});

Object.defineProperty(Movement.prototype, 'speed', {
  get: function() {
    var frame, x1, x2, y1, y2,
        speed = 0,
        parent = this.parent,
        animation = this.animation,
        lastFrame = this.lastFrame;
    if(lastFrame && this.animation.isPlaying) {
      frame = parent.position;
      x1 = lastFrame.x;
      y1 = lastFrame.y;
      x2 = frame.x;
      y2 = frame.y;
      speed = global.Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
      speed /= (1 / Movement.FRAMERATE) * 1000;
    }
    return speed;
  }
});

Object.defineProperty(Movement.prototype, 'vector', {
  get: function() {
    var parent = this.parent,
        animation = this.animation,
        lastFrame = this.lastFrame,
        x1 = y1 = x2 = y2 = 0;
    if(lastFrame) {
      frame = parent.position;
      x1 = lastFrame.x;
      y1 = lastFrame.y;
      x2 = frame.x;
      y2 = frame.y;
    }
    return { x: x2 - x1, y: y2 - y1 };
  }
});

Object.defineProperty(Movement.prototype, 'angle', {
  get: function() {
    var animation = this.animation,
        lastFrame = animation.lastFrame,
        x1 = y1 = x2 = y2 = 0;
    if(lastFrame) {
      frame = animation.frame;
      x1 = lastFrame.x;
      y1 = lastFrame.y;
      x2 = frame.x;
      y2 = frame.y;
    }
    return global.Math.atan2(y1 - y2, x1 - x2);
  }
});

module.exports = Movement;
