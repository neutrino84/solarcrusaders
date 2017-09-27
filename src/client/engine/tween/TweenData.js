var Easing = require('./Easing'),
    Math = require('../utils/Math');

function TweenData(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.vStart = {};
  this.vStartCache = {};
  this.vEnd = {};
  this.vEndCache = {};

  this.duration = 1000;
  this.percent = 0;
  this.value = 0;
  this.repeatCounter = 0;
  this.repeatDelay = 0;
  this.interpolate = false;
  this.yoyo = false;
  this.yoyoDelay = 0;
  this.inReverse = false;
  this.delay = 0;
  this.dt = 0;

  this.startTime = null;

  this.easingFunction = Easing.Default;

  this.interpolationFunction = Math.linearInterpolation;
  this.interpolationContext = Math;

  this.isRunning = false;
  this.isFrom = false;
};

TweenData.PENDING = 0;
TweenData.RUNNING = 1;
TweenData.LOOPED = 2;
TweenData.COMPLETE = 3;

TweenData.prototype = {
  to: function(properties, duration, ease, delay, repeat, yoyo) {
    this.vEnd = properties;
    this.duration = duration;
    this.easingFunction = ease;
    this.delay = delay;
    this.repeatCounter = repeat;
    this.yoyo = yoyo;

    this.isFrom = false;

    return this;
  },

  from: function(properties, duration, ease, delay, repeat, yoyo) {
    this.vEnd = properties;
    this.duration = duration;
    this.easingFunction = ease;
    this.delay = delay;
    this.repeatCounter = repeat;
    this.yoyo = yoyo;

    this.isFrom = true;

    return this;
  },

  start: function() {
    this.startTime = this.game.clock.time + this.delay;

    if(this.parent.reverse) {
      this.dt = this.duration;
    } else {
      this.dt = 0;
    }

    if(this.delay > 0) {
      this.isRunning = false;
    } else {
      this.isRunning = true;
    }
    if(this.isFrom) {
      // Reverse them all and instant set them
      for(var property in this.vStartCache) {
        this.vStart[property] = this.vEndCache[property];
        this.vEnd[property] = this.vStartCache[property];
        this.parent.target[property] = this.vStart[property];
      }
    }

    this.value = 0;
    this.yoyoCounter = 0;

    return this;
  },

  loadValues: function() {
    for(var property in this.parent.properties) {
      // Load the property from the parent object
      this.vStart[property] = this.parent.properties[property];

      // Check if an Array was provided as property value
      if(Array.isArray(this.vEnd[property])) {
        if(this.vEnd[property].length === 0) {
          continue;
        }

        if(this.percent === 0) {
          // Put the start value at the beginning of the array
          // but we only want to do this once, if the Tween hasn't run before
          this.vEnd[property] = [this.vStart[property]].concat(this.vEnd[property]);
        }
      }

      if(typeof this.vEnd[property] !== 'undefined') {
        if(typeof this.vEnd[property] === 'string') {
          // Parses relative end values with start as base (e.g.: +10, -3)
          this.vEnd[property] = this.vStart[property] + parseFloat(this.vEnd[property], 10);
        }

        this.parent.properties[property] = this.vEnd[property];
      } else {
        // Null tween
        this.vEnd[property] = this.vStart[property];
      }

      this.vStartCache[property] = this.vStart[property];
      this.vEndCache[property] = this.vEnd[property];
    }

    return this;
  },

  update: function(time) {
    if(!this.isRunning) {
      if(time >= this.startTime) {
        this.isRunning = true;
      } else {
        return TweenData.PENDING;
      }
    } else {
      // Is Running, but is waiting to repeat
      if(time < this.startTime) {
        return TweenData.RUNNING;
      }
    }

    var ms = (this.parent.frameBased) ? this.game.time.physicsElapsedMS : this.game.clock.elapsedMS;
    if(this.parent.reverse) {
      this.dt -= ms * this.parent.timeScale;
      this.dt = Math.max(this.dt, 0);
    } else {
      this.dt += ms * this.parent.timeScale;
      this.dt = Math.min(this.dt, this.duration);
    }

    this.percent = this.dt / this.duration;
    this.value = this.easingFunction(this.percent);

    for(var property in this.vEnd) {
      var start = this.vStart[property];
      var end = this.vEnd[property];
      if(Array.isArray(end)) {
        this.parent.target[property] = this.interpolationFunction.call(this.interpolationContext, end, this.value);
      } else {
        this.parent.target[property] = start + ((end - start) * this.value);
      }
    }

    if((!this.parent.reverse && this.percent === 1) || (this.parent.reverse && this.percent === 0)) {
      return this.repeat();
    }
    
    return TweenData.RUNNING;
  },

  generateData: function(frameRate) {
    if(this.parent.reverse) {
      this.dt = this.duration;
    } else {
      this.dt = 0;
    }

    var data = [];
    var complete = false;
    var fps = (1 / frameRate) * 1000;
    do {
      if(this.parent.reverse) {
        this.dt -= fps;
        this.dt = Math.max(this.dt, 0);
      } else {
        this.dt += fps;
        this.dt = Math.min(this.dt, this.duration);
      }

      this.percent = this.dt / this.duration;
      this.value = this.easingFunction(this.percent);

      var blob = {};
      for(var property in this.vEnd) {
        var start = this.vStart[property];
        var end = this.vEnd[property];

        if(Array.isArray(end)) {
          blob[property] = this.interpolationFunction(end, this.value);
        } else {
          blob[property] = start + ((end - start) * this.value);
        }
      }

      data.push(blob);

      if((!this.parent.reverse && this.percent === 1) || (this.parent.reverse && this.percent === 0)) {
        complete = true;
      }

    } while(!complete);

    if(this.yoyo) {
      var reversed = data.slice();
      reversed.reverse();
      data = data.concat(reversed);
    }

    return data;
  },

  repeat: function() {
    // If not a yoyo and repeatCounter = 0 then we're done
    if(this.yoyo) {
      // We're already in reverse mode, which means the yoyo has finished and there's no repeats, so end
      if(this.inReverse && this.repeatCounter === 0) {
        // restore the properties
        for(var property in this.vStartCache) {
          this.vStart[property] = this.vStartCache[property];
          this.vEnd[property] = this.vEndCache[property];
        }

        this.inReverse = false;

        return TweenData.COMPLETE;
      }

      this.inReverse = !this.inReverse;
    } else {
      if(this.repeatCounter === 0) {
        return TweenData.COMPLETE;
      }
    }

    if(this.inReverse) {
      // If inReverse we're going from vEnd to vStartCache
      for(var property in this.vStartCache) {
        this.vStart[property] = this.vEndCache[property];
        this.vEnd[property] = this.vStartCache[property];
      }
    } else {
      // If not inReverse we're just repopulating the cache again
      for(var property in this.vStartCache) {
        this.vStart[property] = this.vStartCache[property];
        this.vEnd[property] = this.vEndCache[property];
      }

      // -1 means repeat forever, otherwise decrement the repeatCounter
      // We only decrement this counter if the tween isn't doing a yoyo, as that doesn't count towards the repeat total
      if(this.repeatCounter > 0) {
        this.repeatCounter--;
      }
    }

    this.startTime = this.game.clock.time;

    if(this.yoyo && this.inReverse) {
      this.startTime += this.yoyoDelay;
    } else if(!this.inReverse) {
      this.startTime += this.repeatDelay;
    }

    if(this.parent.reverse) {
      this.dt = this.duration;
    } else {
      this.dt = 0;
    }

    return TweenData.LOOPED;
  }
};

TweenData.prototype.constructor = TweenData;

module.exports = TweenData;
