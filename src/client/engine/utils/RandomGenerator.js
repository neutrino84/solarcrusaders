
function RandomGenerator(seeds) {
  if(seeds === undefined) { seeds = []; }

  this.c = 1;
  this.s0 = 0;
  this.s1 = 0;
  this.s2 = 0;

  this.sow(seeds);
};

RandomGenerator.prototype = {

  rnd: function() {
    var t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32

    this.c = t | 0;
    this.s0 = this.s1;
    this.s1 = this.s2;
    this.s2 = t - this.c;

    return this.s2;
  },

  sow: function(seeds) {
    var seed;

    // Always reset to default seed
    this.s0 = this.hash(' ');
    this.s1 = this.hash(this.s0);
    this.s2 = this.hash(this.s1);
    this.c = 1;

    if(!seeds) {
      return;
    }

    // Apply any seeds
    for(var i = 0; i < seeds.length && (seeds[i] != null); i++) {
      seed = seeds[i];

      this.s0 -= this.hash(seed);
      this.s0 += ~~(this.s0 < 0);
      this.s1 -= this.hash(seed);
      this.s1 += ~~(this.s1 < 0);
      this.s2 -= this.hash(seed);
      this.s2 += ~~(this.s2 < 0);
    }
  },

  hash: function(data) {
    var h, i, n;
        n = 0xefc8249d;
        data = data.toString();

    for(i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000;// 2^32
    }

    return (n >>> 0) * 2.3283064365386963e-10;// 2^-32
  },

  integer: function() {
    return this.rnd.apply(this) * 0x100000000;// 2^32
  },

  frac: function() {
    return this.rnd.apply(this) + (this.rnd.apply(this) * 0x200000 | 0) * 1.1102230246251565e-16;   // 2^-53
  },

  real: function() {
    return this.integer() + this.frac();
  },

  integerInRange: function(min, max) {
    return global.Math.floor(this.realInRange(0, max - min + 1) + min);
  },

  between: function(min, max) {
    return this.integerInRange(min, max);
  },

  realInRange: function(min, max) {
    return this.frac() * (max - min) + min;
  },

  normal: function() {
    return 1 - 2 * this.frac();
  },

  uuid: function() {
    var a = '';
    var b = '';
    for(b = a = ''; a++ < 36; b +=~a % 5 | a * 3&4 ? (a^15 ? 8^this.frac() * (a^20 ? 16 : 4) : 4).toString(16) : '-') {}
    return b;
  },

  pick: function(ary) {
    return ary[this.integerInRange(0, ary.length - 1)];
  },

  weightedPick: function(ary) {
    return ary[~~(global.Math.pow(this.frac(), 2) * (ary.length - 1) + 0.5)];
  },

  timestamp: function(min, max) {
    return this.realInRange(min || 946684800000, max || 1577862000000);
  },

  angle: function() {
    return this.integerInRange(-180, 180);
  },

  angleRadians: function() {
    return this.integerInRange(-global.Math.PI, global.Math.PI);
  }
};

RandomGenerator.prototype.constructor = RandomGenerator;

module.exports = RandomGenerator;
