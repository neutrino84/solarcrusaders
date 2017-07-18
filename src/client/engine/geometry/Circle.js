var Const = require('../const'),
    Point = require('./Point'),
    Rectangle = require('./Rectangle'),
    Math = require('../utils/Math');

function Circle(x, y, radius) {
  x = x || 0;
  y = y || 0;
  radius = radius || 0;

  this.x = x;
  this.y = y;

  this._radius = radius;

  if(radius > 0) {
    this._diameter = radius * 2;
  } else {
    this._diameter = 0;
  }

  this.type = Const.CIRCLE;
};

Circle.prototype = {

  circumference: function() {
    return 2 * (global.Math.PI * this._radius);
  },

  random: function(relative, out) {
    if(relative === undefined) { relative = false; }
    if(out === undefined) { out = new Point(); }

    var t = 2 * global.Math.PI * global.Math.random();
    var u = global.Math.random() + global.Math.random();
    var r = (u > 1) ? 2 - u : u;
    var x = r * global.Math.cos(t);
    var y = r * global.Math.sin(t);

    if(!relative) {
      out.x = this.x + (x * this.radius);
      out.y = this.y + (y * this.radius);
    } else {
      out.x = x * this.radius;
      out.y = y * this.radius;
    }

    return out;
  },

  getBounds: function() {
    return new Rectangle(this.x - this.radius, this.y - this.radius, this.diameter, this.diameter);
  },

  setTo: function(x, y, radius) {
    this.x = x;
    this.y = y;
    
    this._radius = radius;
    this._diameter = radius * 2;

    return this;
  },

  copyFrom: function(source) {
    return this.setTo(source.x, source.y, source.diameter);
  },

  copyTo: function(dest) {
    dest.x = this.x;
    dest.y = this.y;
    dest.radius = this._radius;

    return dest;
  },

  distance: function(dest, round) {
    var distance = Math.distance(this.x, this.y, dest.x, dest.y);
    return round ? global.Math.round(distance) : distance;
  },

  clone: function(output) {
    if(output === undefined || output === null) {
      output = new Circle(this.x, this.y, this.diameter);
    } else {
      output.setTo(this.x, this.y, this.diameter);
    }

    return output;
  },

  contains: function(x, y) {
    return Circle.contains(this, x, y);
  },

  circumferencePoint: function(angle, asDegrees, relative, out) {
    return Circle.circumferencePoint(this, angle, asDegrees, relative, out);
  },

  circumferenceAngle: function(point) {
    return Circle.circumferenceAngle(this, point);
  },

  offset: function(dx, dy) {
    this.x += dx;
    this.y += dy;

    return this;
  },

  offsetPoint: function(point) {
    return this.offset(point.x, point.y);
  },

  toString: function() {
    return '[{Circle (x=' + this.x + ' y=' + this.y + ' diameter=' + this.diameter + ' radius=' + this.radius + ')}]';
  }
};

Circle.prototype.constructor = Circle;

Object.defineProperty(Circle.prototype, 'diameter', {
  get: function() {
    return this._diameter;
  },

  set: function(value) {
    if(value > 0) {
      this._diameter = value;
      this._radius = value * 0.5;
    }
  }
});

Object.defineProperty(Circle.prototype, 'radius', {
  get: function() {
    return this._radius;
  },

  set: function(value) {
    if(value > 0) {
      this._radius = value;
      this._diameter = value * 2;
    }
  }
});

Object.defineProperty(Circle.prototype, 'left', {
  get: function() {
    return this.x - this._radius;
  },

  set: function(value) {
    if(value > this.x) {
      this._radius = 0;
      this._diameter = 0;
    } else {
      this.radius = this.x - value;
    }
  }
});

Object.defineProperty(Circle.prototype, 'right', {
  get: function() {
    return this.x + this._radius;
  },

  set: function(value) {
    if(value < this.x) {
      this._radius = 0;
      this._diameter = 0;
    } else {
      this.radius = value - this.x;
    }
  }
});

Object.defineProperty(Circle.prototype, 'top', {
  get: function() {
      return this.y - this._radius;
  },

  set: function(value) {
    if(value > this.y) {
      this._radius = 0;
      this._diameter = 0;
    } else {
      this.radius = this.y - value;
    }
  }
});

Object.defineProperty(Circle.prototype, 'bottom', {
  get: function() {
    return this.y + this._radius;
  },

  set: function(value) {
    if(value < this.y) {
      this._radius = 0;
      this._diameter = 0;
    } else {
      this.radius = value - this.y;
    }
  }
});

Object.defineProperty(Circle.prototype, 'area', {
  get: function() {
    if(this._radius > 0) {
      return global.Math.PI * this._radius * this._radius;
    } else {
      return 0;
    }
  }
});

Object.defineProperty(Circle.prototype, 'empty', {
  get: function() {
    return (this._diameter === 0);
  },

  set: function(value) {
    if(value === true) {
      this.setTo(0, 0, 0);
    }
  }
});

Circle.contains = function(a, x, y) {
  // Check if x/y are within the bounds first
  if(a.radius > 0 && x >= a.left && x <= a.right && y >= a.top && y <= a.bottom) {
    var dx = (a.x - x) * (a.x - x);
    var dy = (a.y - y) * (a.y - y);

    return (dx + dy) <= (a.radius * a.radius);
  } else {
    return false;
  }
};

Circle.equals = function(a, b) {
  return (a.x == b.x && a.y == b.y && a.diameter == b.diameter);
};

Circle.intersects = function(a, b) {
  return (Math.distance(a.x, a.y, b.x, b.y) <= (a.radius + b.radius));
};

Circle.circumferencePoint = function(a, angle, asDegrees, relative, out) {
  if(asDegrees === undefined) { asDegrees = false; }
  if(relative === undefined) { relative = false; }
  if(out === undefined) { out = new Point(); }

  if(asDegrees === true) {
    angle = Math.degToRad(angle);
  }

  if(!relative) {
    out.x = a.x + a.radius * global.Math.cos(angle);
    out.y = a.y + a.radius * global.Math.sin(angle);
  } else {
    out.x = a.radius * global.Math.cos(angle);
    out.y = a.radius * global.Math.sin(angle);
  }

  return out;
};

Circle.circumferenceAngle = function(a, point) {
  return global.Math.atan2(point.y - a.y, point.x - a.x);
};

Circle.intersectsRectangle = function(c, r) {
  var cx = global.Math.abs(c.x - r.x - r.halfWidth);
  var xDist = r.halfWidth + c.radius;

  if(cx > xDist) {
    return false;
  }

  var cy = global.Math.abs(c.y - r.y - r.halfHeight);
  var yDist = r.halfHeight + c.radius;

  if(cy > yDist) {
    return false;
  }

  if(cx <= r.halfWidth || cy <= r.halfHeight) {
    return true;
  }

  var xCornerDist = cx - r.halfWidth;
  var yCornerDist = cy - r.halfHeight;
  var xCornerDistSq = xCornerDist * xCornerDist;
  var yCornerDistSq = yCornerDist * yCornerDist;
  var maxCornerDistSq = c.radius * c.radius;

  return xCornerDistSq + yCornerDistSq <= maxCornerDistSq;
};

module.exports = Circle;
