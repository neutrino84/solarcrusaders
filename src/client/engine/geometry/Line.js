var Const = require('../const'),
    Point = require('./Point'),
    Math = require('../utils/Math');
  
function Line(x1, y1, x2, y2) {
  if(arguments.length === 4 ||
      arguments.length === 0) {
    x1 = x1 || 0;
    y1 = y1 || 0;
    x2 = x2 || 0;
    y2 = y2 || 0;

    this.start = new Point(x1, y1);
    this.end = new Point(x2, y2);
  } else {
    this.start = new Point().copyFrom(x1);
    this.end = new Point().copyFrom(y1);
  }
  this.type = Const.LINE;
};

Line.prototype = {

  setTo: function(x1, y1, x2, y2) {
    this.start.setTo(x1, y1);
    this.end.setTo(x2, y2);
    return this;
  },

  fromSprite: function(startSprite, endSprite) {
    return this.setTo(startSprite.x, startSprite.y, endSprite.x, endSprite.y);
  },

  fromAngle: function(x, y, angle, length) {
    this.start.setTo(x, y);
    this.end.setTo(x + (global.Math.cos(angle) * length), y + (global.Math.sin(angle) * length));
    
    return this;
  },

  rotate: function(angle, asDegrees) {
    var cx = (this.start.x + this.end.x) / 2,
        cy = (this.start.y + this.end.y) / 2;
    
    this.start.rotate(cx, cy, angle, asDegrees);
    this.end.rotate(cx, cy, angle, asDegrees);
    
    return this;
  },

  rotateAround: function(x, y, angle, asDegrees) {
    this.start.rotate(x, y, angle, asDegrees);
    this.end.rotate(x, y, angle, asDegrees);

    return this;
  },

  intersects: function(line, asSegment, result) {
    return Line.intersectsPoints(this.start, this.end, line.start, line.end, asSegment, result);
  },

  reflect: function(line) {
    return Line.reflect(this, line);
  },

  midPoint: function(out) {
    if(out === undefined) { out = new Point(); }

    out.x = (this.start.x + this.end.x) / 2;
    out.y = (this.start.y + this.end.y) / 2;

    return out;
  },

  centerOn: function(x, y) {
    var cx = (this.start.x + this.end.x) / 2,
        cy = (this.start.y + this.end.y) / 2,
        tx = x - cx,
        ty = y - cy;

    this.start.add(tx, ty);
    this.end.add(tx, ty);

    return this;
  },

  pointOnLine: function(x, y) {
    return ((x - this.start.x) * (this.end.y - this.start.y) === (this.end.x - this.start.x) * (y - this.start.y));
  },

  pointOnSegment: function(x, y) {
    var xMin = global.Math.min(this.start.x, this.end.x),
        xMax = global.Math.max(this.start.x, this.end.x),
        yMin = global.Math.min(this.start.y, this.end.y),
        yMax = global.Math.max(this.start.y, this.end.y);

    return (this.pointOnLine(x, y) && (x >= xMin && x <= xMax) && (y >= yMin && y <= yMax));
  },

  pointAtDistance: function(distance, out) {
    return Line.pointAtDistance(this.start, this.end, distance, out);
  },

  random: function(out) {
    if(out === undefined) { out = new Point(); }

    var t = global.Math.random();

    out.x = this.start.x + t * (this.end.x - this.start.x);
    out.y = this.start.y + t * (this.end.y - this.start.y);

    return out;
  },

  coordinatesOnLine: function(stepRate, results) {
    if(stepRate === undefined) { stepRate = 1; }
    if(results === undefined) { results = []; }

    var x1 = global.Math.round(this.start.x),
        y1 = global.Math.round(this.start.y),
        x2 = global.Math.round(this.end.x),
        y2 = global.Math.round(this.end.y),
        dx = global.Math.abs(x2 - x1),
        dy = global.Math.abs(y2 - y1),
        sx = (x1 < x2) ? 1 : -1,
        sy = (y1 < y2) ? 1 : -1,
        err = dx - dy;

    results.push([x1, y1]);

    var i = 1;
    while(!((x1 == x2) && (y1 == y2))) {
      var e2 = err << 1;

      if(e2 > -dy) {
        err -= dy;
        x1 += sx;
      }

      if(e2 < dx) {
        err += dx;
        y1 += sy;
      }

      if(i % stepRate === 0) {
        results.push([x1, y1]);
      }

      i++;
    }

    return results;
  },

  clone: function(output) {
    if(output === undefined || output === null) {
      output = new Line(this.start.x, this.start.y, this.end.x, this.end.y);
    } else {
      output.setTo(this.start.x, this.start.y, this.end.x, this.end.y);
    }

    return output;
  }

};

Object.defineProperty(Line.prototype, 'length', {
  get: function() {
    return global.Math.sqrt((this.end.x - this.start.x) * (this.end.x - this.start.x) + (this.end.y - this.start.y) * (this.end.y - this.start.y));
  }
});

Object.defineProperty(Line.prototype, 'angle', {
  get: function() {
      return global.Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
  }
});

Object.defineProperty(Line.prototype, 'slope', {
  get: function() {
    return (this.end.y - this.start.y) / (this.end.x - this.start.x);
  }
});

Object.defineProperty(Line.prototype, 'perpSlope', {
  get: function() {
    return -((this.end.x - this.start.x) / (this.end.y - this.start.y));
  }
});

Object.defineProperty(Line.prototype, 'vector', {
  get: function() {
    return new Point(this.end.x - this.start.x, this.end.y - this.start.y);
  }
});

Object.defineProperty(Line.prototype, 'x', {
  get: function() {
    return global.Math.min(this.start.x, this.end.x);
  }
});

Object.defineProperty(Line.prototype, 'y', {
  get: function() {
    return global.Math.min(this.start.y, this.end.y);
  }
});

Object.defineProperty(Line.prototype, 'left', {
  get: function() {
    return global.Math.min(this.start.x, this.end.x);
  }
});

Object.defineProperty(Line.prototype, 'right', {
  get: function() {
    return global.Math.max(this.start.x, this.end.x);
  }
});

Object.defineProperty(Line.prototype, 'top', {
  get: function() {
    return global.Math.min(this.start.y, this.end.y);
  }
});

Object.defineProperty(Line.prototype, 'bottom', {
  get: function() {
    return global.Math.max(this.start.y, this.end.y);
  }
});

Object.defineProperty(Line.prototype, 'width', {
  get: function() {
    return global.Math.abs(this.start.x - this.end.x);
  }
});

Object.defineProperty(Line.prototype, 'height', {
  get: function() {
    return global.Math.abs(this.start.y - this.end.y);
  }
});

Object.defineProperty(Line.prototype, 'normalX', {
  get: function() {
    return global.Math.cos(this.angle - 1.5707963267948966);
  }
});

Object.defineProperty(Line.prototype, 'normalY', {
  get: function() {
    return global.Math.sin(this.angle - 1.5707963267948966);
  }
});

Object.defineProperty(Line.prototype, 'normalAngle', {
  get: function() {
    return Math.wrap(this.angle - 1.5707963267948966, -global.Math.PI, global.Math.PI);
  }
});

Line.pointAtDistance = function(start, end, distance, out) {
  if(out === undefined) { out = new Point(); }

  out.setTo(end.x - start.x, end.y - start.y);

  out.normalize();
  out.multiply(distance, distance);

  out.x = start.x + out.x;
  out.y = start.y + out.y;

  return out;
};

Line.intersectsPoints = function(a, b, e, f, asSegment, result) {
  if(asSegment === undefined) { asSegment = true; }
  if(result === undefined) { result = new Point(); }

  var a1 = b.y - a.y,
      a2 = f.y - e.y,
      b1 = a.x - b.x,
      b2 = e.x - f.x,
      c1 = (b.x * a.y) - (a.x * b.y),
      c2 = (f.x * e.y) - (e.x * f.y),
      denom = (a1 * b2) - (a2 * b1);

  if(denom === 0) { return null; }

  result.x = ((b1 * c2) - (b2 * c1)) / denom;
  result.y = ((a2 * c1) - (a1 * c2)) / denom;

  if(asSegment) {
    var uc = ((f.y - e.y) * (b.x - a.x) - (f.x - e.x) * (b.y - a.y)),
        ua = (((f.x - e.x) * (a.y - e.y)) - (f.y - e.y) * (a.x - e.x)) / uc,
        ub = (((b.x - a.x) * (a.y - e.y)) - ((b.y - a.y) * (a.x - e.x))) / uc;

    if(ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
      return result;
    } else {
      return null;
    }
  }

  return result;
};

Line.intersects = function(a, b, asSegment, result) {
  return Line.intersectsPoints(a.start, a.end, b.start, b.end, asSegment, result);
};

Line.reflect = function(a, b) {
  return 2 * b.normalAngle - 3.141592653589793 - a.angle;
};

module.exports = Line;
