
var Const = require('../const'),
    Rectangle = require('./Rectangle'),
    Point = require('./Point');

function Ellipse(x, y, width, height) {
  x = x || 0;
  y = y || 0;
  width = width || 0;
  height = height || 0;

  this.x = x;
  this.y = y;

  this.width = width;
  this.height = height;

  this.type = Const.ELLIPSE;
};

Ellipse.prototype = {

  setTo: function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    return this;
  },

  getBounds: function() {
    return new Rectangle(this.x - this.width, this.y - this.height, this.width, this.height);
  },

  copyFrom: function(source) {
    return this.setTo(source.x, source.y, source.width, source.height);
  },

  copyTo: function(dest) {
    dest.x = this.x;
    dest.y = this.y;
    dest.width = this.width;
    dest.height = this.height;

    return dest;
  },

  clone: function(output) {
    if(output === undefined || output === null) {
      output = new Ellipse(this.x, this.y, this.width, this.height);
    } else {
      output.setTo(this.x, this.y, this.width, this.height);
    }

    return output;
  },

  contains: function(x, y) {
    return Ellipse.contains(this, x, y);
  },

  circumferencePoint: function(angle, asDegrees, out) {
    return Ellipse.circumferencePoint(this, angle, asDegrees, out);
  },

  random: function(out) {
    if(out === undefined) { out = new Point(); }

    var p = global.Math.random() * global.Math.PI * 2;
    var r = global.Math.random();

    out.x = global.Math.sqrt(r) * global.Math.cos(p);
    out.y = global.Math.sqrt(r) * global.Math.sin(p);

    out.x = this.x + (out.x * this.width / 2.0);
    out.y = this.y + (out.y * this.height / 2.0);

    return out;
  },

  toString: function() {
      return '[{Ellipse (x=' + this.x + ' y=' + this.y + ' width=' + this.width + ' height=' + this.height + ')}]';
  }

};

Ellipse.prototype.constructor = Ellipse;

Object.defineProperty(Ellipse.prototype, 'left', {
  get: function() {
    return this.x;
  },

  set: function(value) {
    this.x = value;
  }
});

Object.defineProperty(Ellipse.prototype, 'right', {
  get: function() {
    return this.x + this.width;
  },

  set: function(value) {
    if(value < this.x) {
      this.width = 0;
    } else {
      this.width = value - this.x;
    }
  }
});

Object.defineProperty(Ellipse.prototype, 'top', {
  get: function() {
    return this.y;
  },

  set: function(value) {
    this.y = value;
  }
});

Object.defineProperty(Ellipse.prototype, 'bottom', {
  get: function() {
    return this.y + this.height;
  },

  set: function(value) {
    if(value < this.y) {
      this.height = 0;
    } else {
      this.height = value - this.y;
    }
  }
});

Object.defineProperty(Ellipse.prototype, 'empty', {
  get: function() {
    return (this.width === 0 || this.height === 0);
  },

  set: function(value) {
    if(value === true) {
      this.setTo(0, 0, 0, 0);
    }
  }
});

Ellipse.contains = function(a, x, y) {
  if(a.width <= 0 || a.height <= 0) { return false; }

  // Normalize the coords to an ellipse with center 0,0 and a radius of 0.5
  var normx = ((x - a.x) / a.width) - 0.5;
  var normy = ((y - a.y) / a.height) - 0.5;

  normx *= normx;
  normy *= normy;

  return (normx + normy < 0.25);
};

Ellipse.circumferencePoint = function(a, angle, asDegrees, out) {
  if(asDegrees === undefined) { asDegrees = false; }
  if(out === undefined) { out = new Point(); }

  if(asDegrees === true) {
    angle = global.Math.degToRad(angle);
  }

  out.x = a.x + a.width * global.Math.cos(angle);
  out.y = a.y + a.height * global.Math.sin(angle);

  return out;
};

module.exports = Ellipse;
