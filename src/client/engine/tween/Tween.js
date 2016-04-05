
var TweenData = require('./TweenData'),
    Easing = require('./Easing'),
    Math = require('../utils/Math'),
    EventEmitter = require('eventemitter3');

function Tween(target, game, manager) {
  this.game = game;
  this.target = target;
  this.manager = manager;

  this.timeline = [];

  this.reverse = false;
  this.timeScale = 1;
  this.repeatCounter = 0;
  this.pendingDelete = false;

  this.isRunning = false;
  this.current = 0;

  this.properties = {};

  this.chainedTween = null;
  this.isPaused = false;
  this.frameBased = manager.frameBased;

  this._onUpdateCallback = null;
  this._onUpdateCallbackContext = null;
  this._pausedTime = 0;
  this._codePaused = false;
  this._hasStarted = false;

  EventEmitter.call(this);
};

Tween.prototype = Object.create(EventEmitter.prototype);
Tween.prototype.constructor = Tween;

Tween.prototype.create = function() {
  this.timeline.push(new TweenData(this));
};

Tween.prototype.to = function(properties, duration, ease, autoStart, delay, repeat, yoyo) {
  if(duration === undefined || duration <= 0) { duration = 1000; }
  if(ease === undefined || ease === null) { ease = Easing.Default; }
  if(autoStart === undefined) { autoStart = false; }
  if(delay === undefined) { delay = 0; }
  if(repeat === undefined) { repeat = 0; }
  if(yoyo === undefined) { yoyo = false; }

  if(typeof ease === 'string' && this.manager.easeMap[ease]) {
    ease = this.manager.easeMap[ease];
  }

  if(this.isRunning) {
    console.warn('Tween.to cannot be called after Tween.start');
    return this;
  }

  this.timeline.push(new TweenData(this).to(properties, duration, ease, delay, repeat, yoyo));

  if(autoStart) {
    this.start();
  }

  return this;
};

Tween.prototype.from = function(properties, duration, ease, autoStart, delay, repeat, yoyo) {
  if(duration === undefined) { duration = 1000; }
  if(ease === undefined || ease === null) { ease = Easing.Default; }
  if(autoStart === undefined) { autoStart = false; }
  if(delay === undefined) { delay = 0; }
  if(repeat === undefined) { repeat = 0; }
  if(yoyo === undefined) { yoyo = false; }

  if(typeof ease === 'string' && this.manager.easeMap[ease]) {
    ease = this.manager.easeMap[ease];
  }

  if(this.isRunning) {
    console.warn('Tween.from cannot be called after Tween.start');
    return this;
  }

  this.timeline.push(new TweenData(this).from(properties, duration, ease, delay, repeat, yoyo));

  if(autoStart) {
    this.start();
  }

  return this;
};

Tween.prototype.start = function(index) {
  if(index === undefined) { index = 0; }
  if(this.game === null || this.target === null ||
      this.timeline.length === 0 || this.isRunning) {
    return this;
  }

  // Populate the tween data
  for(var i=0; i<this.timeline.length; i++) {
    // Build our master property list with the starting values
    for(var property in this.timeline[i].vEnd) {
      this.properties[property] = this.target[property] || 0;

      if(!Array.isArray(this.properties[property])) {
        // Ensures we're using numbers, not strings
        this.properties[property] *= 1.0;
      }
    }
  }

  for(var i = 0; i < this.timeline.length; i++) {
    this.timeline[i].loadValues();
  }

  this.manager.add(this);
  this.isRunning = true;

  if(index < 0 || index > this.timeline.length - 1) {
    index = 0;
  }

  this.current = index;
  this.timeline[this.current].start();

  return this;
};

Tween.prototype.stop = function(complete) {
  if(complete === undefined) { complete = false; }

  this.isRunning = false;

  this._onUpdateCallback = null;
  this._onUpdateCallbackContext = null;

  if(complete) {
    this.emit('complete', this);
    this._hasStarted = false;

    if(this.chainedTween) {
      this.chainedTween.start();
    }
  }

  this.manager.remove(this);

  return this;
};

Tween.prototype.updateTweenData = function(property, value, index) {
  if(this.timeline.length === 0) { return this; }
  if(index === undefined) { index = 0; }

  if(index === -1) {
    for(var i = 0; i < this.timeline.length; i++) {
      this.timeline[i][property] = value;
    }
  } else {
    this.timeline[index][property] = value;
  }

  return this;
};

Tween.prototype.delay = function(duration, index) {
  return this.updateTweenData('delay', duration, index);
};

Tween.prototype.repeat = function(total, repeatDelay, index) {
  if(repeatDelay === undefined) { repeatDelay = 0; }
  
  this.updateTweenData('repeatCounter', total, index);
  
  return this.updateTweenData('repeatDelay', repeatDelay, index);
};

Tween.prototype.repeatDelay = function(duration, index) {
  return this.updateTweenData('repeatDelay', duration, index);
};


Tween.prototype.yoyo = function(enable, yoyoDelay, index) {
  if(yoyoDelay === undefined) { yoyoDelay = 0; }

  this.updateTweenData('yoyo', enable, index);

  return this.updateTweenData('yoyoDelay', yoyoDelay, index);
};

Tween.prototype.yoyoDelay = function(duration, index) {
  return this.updateTweenData('yoyoDelay', duration, index);
};

Tween.prototype.easing = function(ease, index) {
  if(typeof ease === 'string' && this.manager.easeMap[ease]) {
    ease = this.manager.easeMap[ease];
  }

  return this.updateTweenData('easingFunction', ease, index);
};

Tween.prototype.interpolation = function(interpolation, context, index) {
  if(context === undefined) { context = Math; }

  this.updateTweenData('interpolationFunction', interpolation, index);

  return this.updateTweenData('interpolationContext', context, index);
};

Tween.prototype.repeatAll = function(total) {
  if(total === undefined) { total = 0; }

  this.repeatCounter = total;

  return this;
};

Tween.prototype.chain = function() {
  var i = arguments.length;

  while (i--) {
    if(i > 0) {
      arguments[i - 1].chainedTween = arguments[i];
    } else {
      this.chainedTween = arguments[i];
    }
  }

  return this;
};

Tween.prototype.loop = function(value) {
  if(value === undefined) { value = true; }

  if(value) {
    this.repeatAll(-1);
  } else {
    this.repeatCounter = 0;
  }

  return this;
};

Tween.prototype.onUpdateCallback = function(callback, callbackContext) {
  this._onUpdateCallback = callback;
  this._onUpdateCallbackContext = callbackContext;

  return this;
};

Tween.prototype.pause = function() {
  this.isPaused = true;
  this._codePaused = true;
  this._pausedTime = this.game.time.time;
};

Tween.prototype._pause = function() {
  if(!this._codePaused) {
    this.isPaused = true;
    this._pausedTime = this.game.time.time;
  }
};

Tween.prototype.resume = function() {
  if(this.isPaused) {
    this.isPaused = false;
    this._codePaused = false;

    for(var i = 0; i < this.timeline.length; i++) {
      if(!this.timeline[i].isRunning) {
        this.timeline[i].startTime += (this.game.time.time - this._pausedTime);
      }
    }
  }
};

Tween.prototype._resume = function() {
  if(this._codePaused) {
    return;
  } else {
    this.resume();
  }
};

Tween.prototype.update = function(time) {
  if(this.pendingDelete) { return false; }
  if(this.isPaused) { return true; }

  var status = this.timeline[this.current].update(time);

  if(status === TweenData.PENDING) {
    return true;
  } else if(status === TweenData.RUNNING) {
    if(!this._hasStarted) {
      this.emit('start', this);
      this._hasStarted = true;
    }

    if(this._onUpdateCallback !== null) {
      this._onUpdateCallback.call(this._onUpdateCallbackContext, this, this.timeline[this.current].value, this.timeline[this.current]);
    }

    // In case the update callback modifies this tween
    return this.isRunning;
  } else if(status === TweenData.LOOPED) {
    if(this.repeatCounter === -1) {
      this.emit('loop', this);
    } else {
      this.emit('repeat', this);
    }
    return true;
  } else if(status === TweenData.COMPLETE) {
    var complete = false;

    // What now?
    if(this.reverse) {
      this.current--;

      if(this.current < 0) {
        this.current = this.timeline.length - 1;
        complete = true;
      }
    } else {
      this.current++;

      if(this.current === this.timeline.length) {
        this.current = 0;
        complete = true;
      }
    }

    if(complete) {
      // We've reached the start or end of the child tweens (depending on Tween.reverse), should we repeat it?
      if(this.repeatCounter === -1) {
        this.timeline[this.current].start();
        this.emit('loop', this);
        
        return true;
      } else if(this.repeatCounter > 0) {
        this.repeatCounter--;
        this.timeline[this.current].start();
        this.emit('repeat', this);

        return true;
      } else {
        // No more repeats and no more children, so we're done
        this.isRunning = false;
        this.emit('complete', this);
        this._hasStarted = false;

        if(this.chainedTween) {
          this.chainedTween.start();
        }

        return false;
      }
    } else {
      this.emit('childComplete', this);
      this.timeline[this.current].start();

      return true;
    }
  }
};

Tween.prototype.generateData = function(frameRate, data) {
  if(this.game === null || this.target === null) { return null; }
  if(frameRate === undefined) { frameRate = 60; }
  if(data === undefined) { data = []; }

  // Populate the tween data
  for(var i = 0; i < this.timeline.length; i++) {
    // Build our master property list with the starting values
    for(var property in this.timeline[i].vEnd) {
      this.properties[property] = this.target[property] || 0;

      if(!Array.isArray(this.properties[property])) {
        // Ensures we're using numbers, not strings
        this.properties[property] *= 1.0;
      }
    }
  }

  for(var i = 0; i < this.timeline.length; i++) {
    this.timeline[i].loadValues();
  }

  for(var i = 0; i < this.timeline.length; i++) {
    data = data.concat(this.timeline[i].generateData(frameRate));
  }

  return data;
}

Object.defineProperty(Tween.prototype, 'totalDuration', {
  get: function() {
    var total = 0;
    for(var i = 0; i < this.timeline.length; i++) {
      total += this.timeline[i].duration;
    }
    return total;
  }
});

Tween.prototype.constructor = Tween;

module.exports = Tween;
