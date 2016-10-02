var degreeToRadiansFactor = global.Math.PI / 180;
var radianToDegreesFactor = 180 / global.Math.PI;

module.exports = {

  PI2: global.Math.PI * 2,

  degToRad: function(degrees) {
    return degrees * degreeToRadiansFactor;
  },

  radToDeg: function(radians) {
    return radians * radianToDegreesFactor;
  },

  fuzzyEqual: function(a, b, epsilon) {
    if(epsilon === undefined) { epsilon = 0.0001; }
    return global.Math.abs(a - b) < epsilon;
  },

  fuzzyLessThan: function(a, b, epsilon) {
    if(epsilon === undefined) { epsilon = 0.0001; }
    return a < b + epsilon;
  },

  fuzzyGreaterThan: function(a, b, epsilon) {
    if(epsilon === undefined) { epsilon = 0.0001; }
    return a > b - epsilon;
  },

  fuzzyCeil: function(val, epsilon) {
    if(epsilon === undefined) { epsilon = 0.0001; }
    return global.Math.ceil(val - epsilon);
  },

  fuzzyFloor: function(val, epsilon) {
    if(epsilon === undefined) { epsilon = 0.0001; }
    return global.Math.floor(val + epsilon);
  },

  average: function() {
    var sum = 0,
        len = arguments.length;
    for(var i = 0; i < len; i++) {
      sum += (+arguments[i]);
    }
    return sum / len;
  },

  shear: function(n) {
    return n % 1;
  },

  snapTo: function(input, gap, start) {
    if(start === undefined) { start = 0; }

    if(gap === 0) {
      return input;
    }

    input -= start;
    input = gap * global.Math.round(input / gap);

    return start + input;
  },

  snapToFloor: function(input, gap, start) {
    if(start === undefined) { start = 0; }
    if(gap === 0) { return input; }

    input -= start;
    input = gap * global.Math.floor(input / gap);

    return start + input;
  },

  snapToCeil: function(input, gap, start) {
    if(start === undefined) { start = 0; }
    if(gap === 0) { return input; }

    input -= start;
    input = gap * global.Math.ceil(input / gap);

    return start + input;
  },

  formatMoney: function(value, places, marker) {
    var value = value / 100,
        places = places || 2,
        marker = marker || ',';
    return value.toFixed(places).replace(/(\d)(?=(\d{3})+\.)/g, '$1' + marker);
  },

  roundTo: function(value, place, base) {
    if(place === undefined) { place = 0; }
    if(base === undefined) { base = 10; }

    var p = global.Math.pow(base, place);

    return global.Math.round(value * p) / p;
  },

  floorTo: function(value, place, base) {
    if(place === undefined) { place = 0; }
    if(base === undefined) { base = 10; }

    var p = global.Math.pow(base, place);

    return global.Math.floor(value * p) / p;
  },

  ceilTo: function(value, place, base) {
    if(place === undefined) { place = 0; }
    if(base === undefined) { base = 10; }

    var p = global.Math.pow(base, place);

    return global.Math.ceil(value * p) / p;
  },

  angleBetween: function(x1, y1, x2, y2) {
    return global.Math.atan2(y2 - y1, x2 - x1);
  },

  angleBetweenY: function(x1, y1, x2, y2) {
    return global.Math.atan2(x2 - x1, y2 - y1);
  },

  angleBetweenPoints: function(point1, point2) {
    return global.Math.atan2(point2.y - point1.y, point2.x - point1.x);
  },

  angleBetweenPointsY: function(point1, point2) {
    return global.Math.atan2(point2.x - point1.x, point2.y - point1.y);
  },

  worldAngleToPointer: function(displayObject, pointer) {
    var dx = pointer.worldX-displayObject.world.x,
        dy = pointer.worldY-displayObject.world.y;
    return global.Math.atan2(dy, dx);
  },

  reverseAngle: function(angleRad) {
    return this.normalizeAngle(angleRad + global.Math.PI, true);
  },

  normalizeAngle: function(angleRad) {
    angleRad = angleRad % (2 * global.Math.PI);
    return angleRad >= 0 ? angleRad : angleRad + 2 * global.Math.PI;
  },

  maxAdd: function(value, amount, max) {
    return global.Math.min(value + amount, max);
  },

  minSub: function(value, amount, min) {
    return global.Math.max(value - amount, min);
  },

  wrap: function(value, min, max) {
    var range = max - min;
    if(range <= 0) {
      return 0;
    }

    var result = (value - min) % range;
    if(result < 0) {
      result += range;
    }

    return result + min;
  },

  wrapValue: function(value, amount, max) {
    var diff;
    value = global.Math.abs(value);
    amount = global.Math.abs(amount);
    max = global.Math.abs(max);
    diff = (value + amount) % max;
    return diff;
  },

  isOdd: function(n) {
    // Does not work with extremely large values
    return !!(n & 1);
  },

  isEven: function(n) {
    // Does not work with extremely large values
    return !(n & 1);
  },

  min: function() {
    var data;
    if(arguments.length === 1 && typeof arguments[0] === 'object') {
      data = arguments[0];
    } else {
      data = arguments;
    }

    for(var i=1, min=0, len=data.length; i<len; i++) {
      if(data[i] < data[min]) {
        min = i;
      }
    }

    return data[min];
  },

  max: function() {
    var data;
    if(arguments.length === 1 && typeof arguments[0] === 'object') {
      data = arguments[0];
    } else {
      data = arguments;
    }

    for(var i=1, max=0, len=data.length; i<len; i++) {
      if(data[i] > data[max]) {
        max = i;
      }
    }

    return data[max];
  },

  minProperty: function(property) {
      var data;
      if(arguments.length === 2 && typeof arguments[1] === 'object') {
        data = arguments[1];
      } else {
        data = arguments.slice(1);
      }

      for(var i=1, min=0, len=data.length; i<len; i++) {
        if(data[i][property] < data[min][property]) {
          min = i;
        }
      }

      return data[min][property];

  },

  maxProperty: function(property) {
    var data;
    if(arguments.length === 2 && typeof arguments[1] === 'object') {
      data = arguments[1];
    } else {
      data = arguments.slice(1);
    }

    for(var i=1, max=0, len=data.length; i<len; i++) {
      if(data[i][property] > data[max][property]) {
        max = i;
      }
    }

    return data[max][property];
  },

  wrapAngle: function(angle, radians) {
    return radians ? this.wrap(angle, -global.Math.PI, global.Math.PI) : this.wrap(angle, -180, 180);
  },

  linearInterpolation: function(v, k) {
    var m = v.length - 1;
    var f = m * k;
    var i = global.Math.floor(f);

    if(k < 0) {
      return this.linear(v[0], v[1], f);
    }

    if(k > 1) {
      return this.linear(v[m], v[m - 1], m - f);
    }

    return this.linear(v[i], v[i + 1 > m ? m : i + 1], f - i);
  },

  bezierInterpolation: function(v, k) {
    var b = 0;
    var n = v.length - 1;
    for(var i = 0; i <= n; i++) {
      b += global.Math.pow(1 - k, n - i) * global.Math.pow(k, i) * v[i] * this.bernstein(n, i);
    }
    return b;
  },

  catmullRomInterpolation: function(v, k) {
    var m = v.length - 1;
    var f = m * k;
    var i = global.Math.floor(f);

    if(v[0] === v[m]) {
      if(k < 0) {
        i = global.Math.floor(f = m * (1 + k));
      }
      return this.catmullRom(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
    } else {
      if(k < 0) {
        return v[0] - (this.catmullRom(v[0], v[0], v[1], v[1], -f) - v[0]);
      }
      if(k > 1) {
        return v[m] - (this.catmullRom(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
      }
      return this.catmullRom(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
    }
  },

  linear: function(p0, p1, t) {
    return (p1 - p0) * t + p0;
  },

  bernstein: function(n, i) {
    return this.factorial(n) / this.factorial(i) / this.factorial(n - i);
  },

  factorial : function( value ){
    if(value === 0) { return 1; }

    var res = value;
    while(--value) {
      res *= value;
    }

    return res;
  },

  catmullRom: function(p0, p1, p2, p3, t) {
    var v0 = (p2 - p0) * 0.5, v1 = (p3 - p1) * 0.5, t2 = t * t, t3 = t * t2;
    return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
  },

  difference: function(a, b) {
    return global.Math.abs(a - b);
  },

  roundAwayFromZero: function(value) {
    // "Opposite" of truncate.
    return (value > 0) ? global.Math.ceil(value) : global.Math.floor(value);
  },

  sinCosGenerator: function(length, sinAmplitude, cosAmplitude, frequency) {
    if(sinAmplitude === undefined) { sinAmplitude = 1.0; }
    if(cosAmplitude === undefined) { cosAmplitude = 1.0; }
    if(frequency === undefined) { frequency = 1.0; }

    var sin = sinAmplitude;
    var cos = cosAmplitude;
    var frq = frequency * global.Math.PI / length;

    var cosTable = [];
    var sinTable = [];

    for(var c=0; c<length; c++) {
      cos -= sin * frq;
      sin += cos * frq;

      cosTable[c] = cos;
      sinTable[c] = sin;
    }

    return { sin: sinTable, cos: cosTable, length: length };
  },

  distance: function(x1, y1, x2, y2) {
    var dx = x1 - x2;
    var dy = y1 - y2;
    return global.Math.sqrt(dx * dx + dy * dy);
  },

  distanceSq: function(x1, y1, x2, y2) {
    var dx = x1 - x2;
    var dy = y1 - y2;
    return dx * dx + dy * dy;
  },

  distancePow: function(x1, y1, x2, y2, pow) {
    if(pow === undefined) { pow = 2; }
    return global.Math.sqrt(global.Math.pow(x2 - x1, pow) + global.Math.pow(y2 - y1, pow));
  },

  clamp: function(x, a, b) {
    return ( x < a ) ? a : ( ( x > b ) ? b : x );
  },

  clampBottom: function(x, a) {
    return x < a ? a : x;
  },

  within: function(a, b, tolerance) {
    return (global.Math.abs(a - b) <= tolerance);
  },

  mapLinear: function(x, a1, a2, b1, b2) {
    return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );
  },

  smoothstep: function(x, min, max) {
    x = global.Math.max(0, global.Math.min(1, (x - min) / (max - min)));
    return x * x * (3 - 2 * x);
  },

  smootherstep: function(x, min, max) {
    x = global.Math.max(0, global.Math.min(1, (x - min) / (max - min)));
    return x * x * x * (x * (x * 6 - 15) + 10);
  },

  sign: function(x) {
    return ( x < 0 ) ? -1 : ( ( x > 0 ) ? 1 : 0 );
  },

  percent: function(a, b, base) {
    if(base === undefined) { base = 0; }
    if(a > b || base > b) {
      return 1;
    } else if(a < base || base > a) {
      return 0;
    } else {
      return (a - base) / b;
    }
  },

  getRandomInt: function (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },

  reverseVector: function(v){
    return {x: v.x * -1, y: v.y * -1};
  }

};
