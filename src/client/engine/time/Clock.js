var Timer = require('./Timer');

function Clock(game) {
  this.game = game;
  
  this.time = 0;
  this.prevTime = 0;

  this.now = 0;
  this.previousDateNow = 0;

  this.elapsed = 0;
  this.elapsedMS = 0;

  this.slowMotion = 1.0;
  this.desiredFpsMult = 1.0 / Clock.DESIRED_FPS;

  this.advancedTiming = true;
  this.suggestedFps = null;
  this.frames = 0;
  this.fps = 0;
  this.fpsMin = 1000;
  this.fpsMax = 0;
  this.msMin = 1000;
  this.msMax = 0;

  this.pauseDuration = 0;

  this.timeToCall = 0;
  this.timeExpected = 0;

  this.events = new Timer(this.game, false);

  this._desiredFps = Clock.DESIRED_FPS;
  this._frameCount = 0;
  this._elapsedAccumulator = 0;
  this._started = 0;
  this._timeLastSecond = 0;
  this._pauseStarted = 0;
  this._justResumed = false;

  this._timers = [];
};

Clock.DESIRED_FPS = 60;

Clock.prototype.constructor = Clock;

Clock.prototype.boot = function() {
  this._started = global.Date.now();
  this.time = global.Date.now();
  this.events.start();
};

Clock.prototype.benchmark = function() {
  this.events.add(10000, function() {
    this.advancedTiming = false;
    if(this.suggestedFps < 57.5) {
      this.game.emit('fpsProblem');
    }
  }, this);
};

Clock.prototype.add = function(timer) {
  this._timers.push(timer);
  return timer;
};

Clock.prototype.create = function(autoDestroy) {
  if(typeof autoDestroy === 'undefined') { autoDestroy = true; }
  var timer = new Timer(this.game, autoDestroy);
  this._timers.push(timer);
  return timer;
};

Clock.prototype.removeAll = function() {
  for (var i=0; i<this._timers.length; i++) {
    this._timers[i].destroy();
  }
  this._timers = [];
  this.events.removeAll();
};

Clock.prototype.update = function(time) {
  this.previousDateNow = this.time;
  this.time = global.Date.now();
  this.elapsedMS = this.time - this.previousDateNow;
  this.prevTime = this.now;
  this.now = time;
  this.elapsed = this.now - this.prevTime;

  if(this.game.raf && this.game.raf._isSetTimeOut) {
    // time to call this function again in ms in case we're using timers 
    // instead of RequestAnimationFrame to update the game
    this.timeToCall = global.Math.floor(global.Math.max(0, (1000.0 / this._desiredFps) - (this.timeExpected - time)));

    // time when the next call is expected if using timers
    this.timeExpected = time + this.timeToCall;
  }

  if(this.advancedTiming) {
    this.updateAdvancedTiming();
  } else {
    this.frames++;
    if(this.now > this._timeLastSecond + 1000) {
      this.fps = global.Math.round((this.frames * 1000) / (this.now - this._timeLastSecond));
      this._timeLastSecond = this.now;
      this.frames = 0;
    }
  }

  // Paused but still running?
  if(!this.game.paused) {
    // Our internal Phaser.Timer
    this.events.update(this.time);

    if(this._timers.length) {
      this.updateTimers();
    }
  }
};

Clock.prototype.refresh = function() {
  var previousDateNow = this.time;

  this.time = global.Date.now();
  this.elapsedMS = this.time - previousDateNow;
};

Clock.prototype.updateTimers = function() {
  // Any game level timers
  var i = 0,
      len = this._timers.length;
  while(i < len) {
    if(this._timers[i].update(this.time)) {
      i++;
    } else {
      // Timer requests to be removed
      this._timers.splice(i, 1);
      len--;
    }
  }
};

Clock.prototype.updateAdvancedTiming = function() {
  // count the number of time.update calls
  this._frameCount++;
  this._elapsedAccumulator += this.elapsed;

  // occasionally recalculate the suggestedFps based on the accumulated elapsed time
  if(this._frameCount >= this._desiredFps * 2) {
    // this formula calculates suggestedFps in multiples of 5 fps
    this.suggestedFps = global.Math.floor(400 / (this._elapsedAccumulator / this._frameCount)) * 2.5;
    this._frameCount = 0;
    this._elapsedAccumulator = 0;
  }

  this.msMin = global.Math.min(this.msMin, this.elapsed);
  this.msMax = global.Math.max(this.msMax, this.elapsed);

  this.frames++;

  if(this.now > this._timeLastSecond + 1000) {
    this.fps = global.Math.round((this.frames * 1000) / (this.now - this._timeLastSecond));
    this.fpsMin = global.Math.min(this.fpsMin, this.fps);
    this.fpsMax = global.Math.max(this.fpsMax, this.fps);
    this._timeLastSecond = this.now;
    this.frames = 0;
  }
};

Clock.prototype.gamePaused = function() {
  this._pauseStarted = global.Date.now();
  this.events.pause();

  var i = this._timers.length;
  while(i--) {
    this._timers[i]._pause();
  }
};

Clock.prototype.gameResumed = function() {
  this.time = global.Date.now();
  this.pauseDuration = this.time - this._pauseStarted;
  this.events.resume();

  var i = this._timers.length;
  while(i--) {
    this._timers[i]._resume();
  }
};

Clock.prototype.totalElapsedSeconds = function() {
  return (this.time - this._started) * 0.001;
};

Clock.prototype.elapsedSince = function(since) {
  return this.time - since;
};

Clock.prototype.elapsedSecondsSince = function(since) {
  return (this.time - since) * 0.001;
};

Clock.prototype.reset = function() {
  this._started = this.time;
  this.removeAll();
};

Object.defineProperty(Clock.prototype, 'desiredFps', {
  get: function() {
    return this._desiredFps;
  },

  set: function(value) {
    this._desiredFps = value;
    this.desiredFpsMult = 1.0 / value;
  }
});

module.exports = Clock;
