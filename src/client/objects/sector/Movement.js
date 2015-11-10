
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
  
  // animation
  this.animation = new Animation(parent.game, parent.position, []);
  this.animation.on('complete', this._movementComplete, this);

  EventEmitter.call(this);
}

Movement.FRAMERATE = 70;
Movement.SPEED_CONSTANT = 30.0;

Movement.prototype = Object.create(EventEmitter.prototype);
Movement.prototype.constructor = Movement;

Movement.prototype.update = function() {
  this.animation.update();

  var parent = this.parent,
      animation = this.animation,
      lastFrame = animation.lastFrame,
      a1, a2;
  if(animation.isPlaying && lastFrame) {
    a1 = lastFrame.y - parent.position.y;
    a2 = lastFrame.x - parent.position.x;

    if(a1 !== 0 && a2 !== 0) {
      parent.rotation = global.Math.atan2(a1, a2);
    }
  }
};

Movement.prototype.plot = function(point, current, previous) {
  this.startPosition = current ? current : this.parent.position;
  this.lastPosition = previous ? previous : this.previous;

  this.destination.copyFrom(point);

  this.oribital = this._findTangentCircle();

  if(!this.oribital.contains(point.x, point.y)) {
    this.valid = true;
    this.tangentPoint = this._findTangentPoint(this.destination, this.oribital);

    this.startAngle = this.oribital.circumferenceAngle(this.startPosition);
    this.endAngle = this.oribital.circumferenceAngle(this.tangentPoint);
    
    this.arcLength = this._findArcLength(this.startPosition, this.tangentPoint, this.oribital);
    this.linearLength = this.tangentPoint.distance(this.destination);
    this.totalLength = this.arcLength + this.linearLength;

    this.animation.stop();
    this.animation.play(this.generateData(), this.duration);
  } else {
    this.valid = false;
  }
};

Movement.prototype.plotLinear = function(point, current) {
  this.destination.copyFrom(point);
  this.tangentPoint = new engine.Point(current.x, current.y);
  this.linearLength = this.tangentPoint.distance(this.destination);
  this.totalLength = this.linearLength;

  this.animation.stop();
  this.animation.play(this.generateData([
    new LinearPath(this, 0.0, 1.0,  engine.Easing.Default)]), this.duration);
};

Movement.prototype.generateData = function(paths) {
  var self = this,
      dt, duration, finalDuration = 0, path, complete,
      percent, value,
      start, end, interpolate,
      point, data = [],
      fps = (1 / Movement.FRAMERATE) * 1000,
      isPlaying = this.animation.isPlaying,
      paths = paths || [
        new ArcPath(this, 0.0, 1.0, engine.Easing.Default),
        // new ArcPath(this, 0.1, 1.0),
        // new LinearPath(this, 0.0, 0.75),
        new LinearPath(this, 0.0, 1.0,  engine.Easing.Default)
      ],
      length = paths.length;


  for(var p=0; p<length; p++) {
    dt = 0;
    path = paths[p];
    duration = path.duration;
    finalDuration += duration;
    complete = false;

    do {
      dt += fps;
      percent = global.Math.min(dt / duration, 1);

      value = path.easing(percent);
      interpolated = path.start + ((path.end - path.start) * value);
      point = path.interpolate(this, interpolated);

      data.push({ x: point.x, y: point.y });

      if(percent === 1) {
        complete = true;
      }
    } while(!complete);
  }

  this.duration = finalDuration;

  return data;
};

Movement.prototype.drawData = function(color) {
  if(!this.trajectoryGraphics) { return; }
  
  var frameData = this.animation.frameData,
      color = color || 0x3366FF;
  for(var f in frameData) {
    if(global.parseInt(f, 10) % 20 !== 0) { continue; }
    this.trajectoryGraphics.lineStyle(0);
    this.trajectoryGraphics.beginFill(color, 0.5);
    this.trajectoryGraphics.drawCircle(frameData[f].x, frameData[f].y, 2);
    this.trajectoryGraphics.endFill();
  }
}

Movement.prototype.drawDebug = function() {
  if(!this.parent.isPlayer || !this.trajectoryGraphics) { return; }

  // draw line from start to destination
  // this.trajectoryGraphics.lineStyle(1.0, 0x6699FF, 1.0);
  // this.trajectoryGraphics.moveTo(this.startPosition.x, this.startPosition.y);
  // this.trajectoryGraphics.lineTo(this.lastPosition.x, this.lastPosition.y);

  // draw start circle
  // this.trajectoryGraphics.lineStyle(1.0, 0xFFFFFF, 0.25);
  // this.trajectoryGraphics.beginFill(0x000000, 1.0)
  // this.trajectoryGraphics.drawCircle(this.startPosition.x, this.startPosition.y, 5);
  // this.trajectoryGraphics.endFill();

  // draw destination circle
  this.trajectoryGraphics.lineStyle(0);
  this.trajectoryGraphics.beginFill(0x00FFFF, 0.5);
  this.trajectoryGraphics.drawCircle(this.destination.x, this.destination.y, 10);
  this.trajectoryGraphics.endFill();

  // draw turning oribit
  // this.trajectoryGraphics.lineStyle(1.0, 0xFFFFFF, 0.1);
  // this.trajectoryGraphics.drawCircle(this.oribital.x, this.oribital.y, this.oribital.radius);
  this.trajectoryGraphics.lineStyle(5.0, 0x00FFFF, 0.5);
  this.trajectoryGraphics.arc(this.oribital.x, this.oribital.y, this.oribital.radius, this.startAngle, this.endAngle, this.anticlockwise);
  this.trajectoryGraphics.moveTo(this.tangentPoint.x, this.tangentPoint.y);
  this.trajectoryGraphics.lineTo(this.destination.x, this.destination.y);

  // draw tangent lines to destination
  // this.trajectoryGraphics.lineStyle(1.0, 0xFFFFFF, 0.5);
  // this.trajectoryGraphics.moveTo(this.destination.x, this.destination.y);
  // this.trajectoryGraphics.lineTo(this.tangentPoint.x, this.tangentPoint.y);
};

Movement.prototype._movementComplete = function() {
  this.animation.reset();
};

Movement.prototype._findTangentCircle = function() {
  var perp = new engine.Point().copyFrom(this.lastPosition).rotate(this.startPosition.x, this.startPosition.y, -global.Math.PI / 2),
      point1 = engine.Line.pointAtDistance(this.startPosition, perp, this.config.oribit.radius),
      point2 = engine.Line.pointAtDistance(this.startPosition, perp, -this.config.oribit.radius),
      len1 = point1.distance(this.destination),
      len2 = point2.distance(this.destination),
      point = len1 > len2 ? point2 : point1;

  if(len1 > len2) {
    point = point2;
    this.anticlockwise = true;
  } else {
    point = point1;
    this.anticlockwise = false;
  }

  // this.trajectoryGraphics.lineStyle(1.0, 0x3366FF, 0.25);
  // this.trajectoryGraphics.drawCircle(point1.x, point1.y, this.config.oribit.radius);
  // this.trajectoryGraphics.drawCircle(point2.x, point2.y, this.config.oribit.radius);

  return new engine.Circle(point.x, point.y, this.config.oribit.radius);
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

Movement.prototype._generateLastPosition = function() {
  var rotation = this.parent.rotation;
  return new engine.Point(
    this.startPosition.x + (100 * global.Math.cos(rotation)),
    this.startPosition.y + (100 * global.Math.sin(rotation)))
};

Object.defineProperty(Movement.prototype, 'previous', {
  get: function() {
    return this.animation.lastFrame ? this.animation.lastFrame : this._generateLastPosition();
  }
});

Object.defineProperty(Movement.prototype, 'throttle', {
  get: function() {
    return this._throttle;
  },

  set: function(value) {
    this._throttle = value;
    this._linearSpeed = this.linearSpeed;
    this._arcSpeed = this.arcSpeed;
  }
});

Object.defineProperty(Movement.prototype, 'linearSpeed', {
  get: function() {
    return this._linearSpeed || (this._throttle * (Movement.SPEED_CONSTANT / this.config.speed));
  }
});

Object.defineProperty(Movement.prototype, 'arcSpeed', {
  get: function() {
    return this._arcSpeed || (this.config.oribit.radius / this.linearSpeed);
  }
});

Object.defineProperty(Movement.prototype, 'speed', {
  get: function() {
    var frame, x1, x2, y1, y2,
        speed = 0,
        animation = this.animation,
        lastFrame = animation.lastFrame;
    if(lastFrame) {
      frame = animation.frame;
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

Object.defineProperty(Movement.prototype, 'maxSpeed', {
  get: function() {
    if(this._maxSpeed) {
      return this._maxSpeed;
    }
    return this._maxSpeed = 1 / (Movement.SPEED_CONSTANT / this.config.speed);
  }
});

Object.defineProperty(Movement.prototype, 'vector', {
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
    return new engine.Point(x2 - x1, y2 - y1);
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
