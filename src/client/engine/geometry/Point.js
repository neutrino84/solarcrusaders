var Const = require('../const'),
	  Math = require('../utils/Math');

function Point(x, y) {
  x = x || 0;
  y = y || 0;
   
  this.x = x;
  this.y = y;

  this.type = Const.POINT;
};

Point.prototype = {

  copyFrom: function(source) {
    return this.setTo(source.x, source.y);
  },

  invert: function() {
    return this.setTo(this.y, this.x);
  },

  setTo: function(x, y) {
    this.x = x || 0;
    this.y = y || ((y !== 0) ? this.x : 0);

    return this;
  },

  set: function(x, y) {
    this.x = x || 0;
    this.y = y || ((y !== 0) ? this.x : 0);

    return this;
  },

  add: function(x, y) {
    this.x += x;
    this.y += y;

    return this;
  },

  subtract: function(x, y) {
    this.x -= x;
    this.y -= y;

    return this;
  },

  multiply: function(x, y) {
    this.x *= x;
    this.y *= y;

    return this;
  },

  divide: function(x, y) {
    this.x /= x;
    this.y /= y;

    return this;
  },

  clampX: function(min, max) {
    this.x = Math.clamp(this.x, min, max);
    
    return this;
  },

  clampY: function(min, max) {
    this.y = Math.clamp(this.y, min, max);

    return this;
  },

  clamp: function(min, max) {
    this.x = Math.clamp(this.x, min, max);
    this.y = Math.clamp(this.y, min, max);

    return this;
  },

  toFixed: function(places) {
    places = places || 2;

    this.x = Math.roundTo(this.x, places);
    this.y = Math.roundTo(this.y, places);

    return this;
  },

  clone: function(output) {
    if(typeof output === "undefined" || output === null) {
      output = new Point(this.x, this.y);
    } else {
      output.setTo(this.x, this.y);
    }

    return output;
  },

  copyTo: function(dest) {
    dest.x = this.x;
    dest.y = this.y;

    return dest;
  },

  distance: function(dest, round) {
    return Point.distance(this, dest, round);
  },

  equals: function(a) {
    return (a.x === this.x && a.y === this.y);
  },

  //.. TODO: this is only to 180 degrees :(
  angle: function(a, asDegrees) {
    if(typeof asDegrees === 'undefined') { asDegrees = false; }

    if(asDegrees) {
      return Math.radToDeg(global.Math.atan2(a.y - this.y, a.x - this.x));
    } else {
      return global.Math.atan2(a.y - this.y, a.x - this.x);
    }
  },

  rotate: function(x, y, angle, asDegrees, distance) {
    return Point.rotate(this, x, y, angle, asDegrees, distance);
  },

  getMagnitude: function() {
    return global.Math.sqrt((this.x * this.x) + (this.y * this.y));
  },

  getMagnitudeSq: function() {
    return (this.x * this.x) + (this.y * this.y);
  },

  setMagnitude: function(magnitude) {
    return this.normalize().multiply(magnitude, magnitude);
  },

  normalize: function() {
    if(!this.isZero()) {
      var m = this.getMagnitude();
      this.x /= m;
      this.y /= m;
    }

    return this;
  },

  isZero: function() {
    return (this.x === 0 && this.y === 0);
  },

  dot: function(a) {
    return ((this.x * a.x) + (this.y * a.y));
  },

  cross: function(a) {
    return ((this.x * a.y) - (this.y * a.x));
  },

  interpolate: function(a, f, out) {
    return Point.interpolate(this, a, f, out);
  },

  perp: function() {
    return this.setTo(-this.y, this.x);
  },

  rperp: function() {
    return this.setTo(this.y, -this.x);
  },

  normalRightHand: function() {
    return this.setTo(this.y * -1, this.x);
  },

  floor: function() {
    return this.setTo(global.Math.floor(this.x), global.Math.floor(this.y));
  },

  ceil: function() {
    return this.setTo(global.Math.ceil(this.x), global.Math.ceil(this.y));
  },

  toString: function() {
    return '[{Point (x=' + this.x + ' y=' + this.y + ')}]';
  }
};

Point.prototype.constructor = Point;

Point.add = function(a, b, out) {
  if(out === undefined) { out = new Point(); }

  out.x = a.x + b.x;
  out.y = a.y + b.y;

  return out;
};

Point.subtract = function(a, b, out) {
  if(out === undefined) { out = new Point(); }

  out.x = a.x - b.x;
  out.y = a.y - b.y;

  return out;
};

Point.multiply = function(a, b, out) {
  if(out === undefined) { out = new Point(); }

  out.x = a.x * b.x;
  out.y = a.y * b.y;

  return out;
};

Point.divide = function(a, b, out) {
  if(out === undefined) { out = new Point(); }

  out.x = a.x / b.x;
  out.y = a.y / b.y;

  return out;
};

Point.equals = function(a, b) {
  return (a.x === b.x && a.y === b.y);
};

Point.angle = function(a, b) {
  var angle = global.Math.atan2(a.y - b.y, a.x - b.x);
  if(angle < 0) {
    angle += 2 * global.Math.PI;
  }
  return angle;
};

Point.negative = function(a, out) {
  if(out === undefined) { out = new Point(); }
  return out.setTo(-a.x, -a.y);
};

Point.multiplyAdd = function(a, b, s, out) {
  if(out === undefined) { out = new Point(); }
  return out.setTo(a.x + b.x * s, a.y + b.y * s);
};

Point.interpolate = function(a, b, f, out) {
  if(out === undefined) { out = new Point(); }
  return out.setTo(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f);
};

Point.cosineInterpolate = function(a, b, f, out) {
  if(out === undefined) { out = new Point(); }
  f = (1 - global.Math.cos(f * global.Math.PI)) / 2;
  return out.setTo((a.x * (1 - f)) + (b.x * f), (a.y * (1 - f)) + (b.y * f));
};

Point.perp = function(a, out) {
  if(out === undefined) { out = new Point(); }
  return out.setTo(-a.y, a.x);
};

Point.rperp = function(a, out) {
  if(out === undefined) { out = new Point(); }
  return out.setTo(a.y, -a.x);
};

Point.distance = function(a, b, round) {
  var distance = Math.distance(a.x, a.y, b.x, b.y);
  return round ? global.Math.round(distance) : distance;
};

Point.project = function(a, b, out) {
  if(out === undefined) { out = new Point(); }
  var amt = a.dot(b) / b.getMagnitudeSq();
  if(amt !== 0) {
    out.setTo(amt * b.x, amt * b.y);
  }
  return out;
};

Point.projectUnit = function(a, b, out) {
  if(out === undefined) { out = new Point(); }
  var amt = a.dot(b);
  if(amt !== 0) {
    out.setTo(amt * b.x, amt * b.y);
  }
  return out;
};

Point.normalRightHand = function(a, out) {
  if(out === undefined) { out = new Point(); }
  return out.setTo(a.y * -1, a.x);
};

Point.normalize = function(a, out) {
  if(out === undefined) { out = new Point(); }
  var m = a.getMagnitude();
  if(m !== 0) {
    out.setTo(a.x / m, a.y / m);
  }
  return out;
};

Point.rotate = function(a, x, y, angle, asDegrees, distance) {
  if(asDegrees) { angle = Math.degToRad(angle); }
  if(distance === undefined) {
    a.subtract(x, y);

    var s = global.Math.sin(angle);
    var c = global.Math.cos(angle);

    var tx = c * a.x - s * a.y;
    var ty = s * a.x + c * a.y;

    a.x = tx + x;
    a.y = ty + y;
  } else {
    var t = angle + global.Math.atan2(a.y - y, a.x - x);
    a.x = x + distance * global.Math.cos(t);
    a.y = y + distance * global.Math.sin(t);
  }
  return a;
};

Point.centroid = function(points, out) {
    if(out === undefined) { out = new Point(); }

    if(Object.prototype.toString.call(points) !== '[object Array]') {
      throw new Error("Point. Parameter 'points' must be an array");
    }

    var pointslength = points.length;

    if(pointslength < 1) {
      throw new Error("Point. Parameter 'points' array must not be empty");
    }

    if(pointslength === 1) {
      out.copyFrom(points[0]);
      return out;
    }

    for(var i = 0; i < pointslength; i++) {
      Point.add(out, points[i], out);
    }

    out.divide(pointslength, pointslength);

    return out;
};

Point.parse = function(obj, xProp, yProp) {
    xProp = xProp || 'x';
    yProp = yProp || 'y';

    var point = new Point();

    if(obj[xProp]) {
      point.x = parseInt(obj[xProp], 10);
    }

    if(obj[yProp]) {
      point.y = parseInt(obj[yProp], 10);
    }

    return point;
};

module.exports = Point;
