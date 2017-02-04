var Timer = require('../client/engine/time/Timer');

function Clock(game) {
  this.game = game;
  
  this.time = 0;
  this.previousDateNow = 0;
  this.elapsedMS = 0;
  this.started = 0;
  this.desiredFps = Clock.DESIRED_FPS;
  this.stepSize = 1000 / Clock.DESIRED_FPS;
  this.events = new Timer(this.game, false);

  this.timers = [];
};

Clock.DESIRED_FPS = 10;

Clock.prototype.constructor = Clock;

Clock.prototype.init = function() {
  this.started = global.Date.now();
  this.time = global.Date.now();
  this.events.start();
};

Clock.prototype.update = function() {
  this.previousDateNow = this.time;
  this.time = global.Date.now();
  this.elapsedMS = this.time - this.previousDateNow;

  this.events.update(this.time);

  if(this.timers.length) {
    this.updateTimers();
  }
};

Clock.prototype.throttle = function(fn, threshhold, context) {
  var last,
      deferTimer,
      threshhold = threshhold || 250,
      clock = this;
  return function(arg) {
    var context = context || this,
        now = clock.time;
    if(last && now < last + threshhold) {
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.call(context, arg);
      }, threshhold);
    } else {
      last = now;
      fn.call(context, arg);
    }
  };
};

Clock.prototype.add = function(timer) {
  this.timers.push(timer);
  return timer;
};

Clock.prototype.create = function(autoDestroy) {
  if(typeof autoDestroy === 'undefined') { autoDestroy = true; }
  var timer = new Timer(this.game, autoDestroy);
  this.timers.push(timer);
  return timer;
};

Clock.prototype.removeAll = function() {
  for (var i=0; i<this.timers.length; i++) {
    this.timers[i].destroy();
  }
  this.timers = [];
  this.events.removeAll();
};

Clock.prototype.reset = function() {
  this.started = this.time;
  this.removeAll();
};

Clock.prototype.refresh = function() {
  var previousDateNow = this.time;

  this.time = global.Date.now();
  this.elapsedMS = this.time - previousDateNow;
};

Clock.prototype.updateTimers = function() {
  // Any game level timers
  var i = 0,
      len = this.timers.length;
  while(i < len) {
    if(this.timers[i].update(this.time)) {
      i++;
    } else {
      // Timer requests to be removed
      this.timers.splice(i, 1);
      len--;
    }
  }
};

Clock.prototype.totalElapsedSeconds = function() {
  return (this.time - this.started) * 0.001;
};

Clock.prototype.elapsedSince = function(since) {
  return this.time - since;
};

Clock.prototype.elapsedSecondsSince = function(since) {
  return (this.time - since) * 0.001;
};

module.exports = Clock;
