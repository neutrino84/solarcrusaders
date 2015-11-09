
var TimerEvent = require('./TimerEvent'),
    EventEmitter = require('eventemitter3');

function Timer(game, autoDestroy) {
  if(autoDestroy === undefined) { autoDestroy = true; }

  this.game = game;
  this.running = false;
  this.autoDestroy = autoDestroy;
  this.expired = false;
  this.elapsed = 0;
  this.events = [];

  this.nextTick = 0;
  this.timeCap = 1000;
  this.paused = false;

  this._codePaused = false;
  this._started = 0;
  this._pauseStarted = 0;
  this._pauseTotal = 0;

  this._now = global.Date.now();
  this._len = 0;
  this._marked = 0;
  this._i = 0;
  this._diff = 0;
  this._newTick = 0;

  EventEmitter.call(this);
};

Timer.MINUTE = 60000;
Timer.SECOND = 1000;
Timer.HALF = 500;
Timer.QUARTER = 250;

Timer.prototype = Object.create(EventEmitter.prototype);
Timer.prototype.constructor = Timer;

Timer.prototype.create = function(delay, loop, repeatCount, callback, callbackContext, args) {
  delay = global.Math.round(delay);

  var ev, tick = delay;
  if(this._now === 0) {
    tick += this.game.clock.time;
  } else {
    tick += this._now;
  }

  ev = new TimerEvent(this, delay, tick, repeatCount, loop, callback, callbackContext, args);
  
  this.events.push(ev);
  this.order();
  this.expired = false;

  return ev;
};

Timer.prototype.add = function(delay, callback, callbackContext) {
  return this.create(delay, false, 0, callback, callbackContext,
    Array.prototype.slice.call(arguments, 3));
};

Timer.prototype.repeat = function(delay, repeatCount, callback, callbackContext) {
  return this.create(delay, false, repeatCount, callback, callbackContext,
    Array.prototype.slice.call(arguments, 4));
};

Timer.prototype.loop = function(delay, callback, callbackContext) {
  return this.create(delay, true, 0, callback, callbackContext,
    Array.prototype.slice.call(arguments, 3));
};

Timer.prototype.start = function(delay) {
  if(this.running) { return; }

  this._started = this.game.clock.time + (delay || 0);
  this.running = true;

  for(var i = 0; i < this.events.length; i++) {
    this.events[i].tick = this.events[i].delay + this._started;
  }
};

Timer.prototype.stop = function(clearEvents) {
  this.running = false;

  if(clearEvents === undefined) { clearEvents = true; }
  if(clearEvents) { this.events.length = 0; }
};

Timer.prototype.remove = function(event) {
  for(var i = 0; i < this.events.length; i++) {
    if(this.events[i] === event) {
      this.events[i].pendingDelete = true;
      return true;
    }
  }
  return false;
};

Timer.prototype.order = function() {
  if(this.events.length > 0) {
    // Sort the events so the one with the lowest tick is first
    this.events.sort(this.sortHandler);
    this.nextTick = this.events[0].tick;
  }
};

Timer.prototype.sortHandler = function(a, b) {
  if(a.tick < b.tick) {
    return -1;
  } else if(a.tick > b.tick) {
    return 1;
  }
  return 0;
};

Timer.prototype.clearPendingEvents = function() {
  this._i = this.events.length;

  while(this._i--) {
    if(this.events[this._i].pendingDelete) {
      this.events.splice(this._i, 1);
    }
  }

  this._len = this.events.length;
  this._i = 0;
};

Timer.prototype.update = function(time) {
  if(this.paused) { return true; }

  this.elapsed = time - this._now;
  this._now = time;

  // spike-dislike
  if(this.elapsed > this.timeCap) {
    // For some reason the time between now and the last time the game was updated was larger than our timeCap.
    // This can happen if the Stage.disableVisibilityChange is true and you swap tabs, which makes the raf pause.
    // In this case we need to adjust the TimerEvents and nextTick.
    this.adjustEvents(time - this.elapsed);
    console.warn('Timer: elapsed > timeCap code branch executed, adjusted event timers');
  }

  this._marked = 0;

  // Clears events marked for deletion and resets _len and _i to 0.
  this.clearPendingEvents();

  var timeEvent;
  if(this.running && this._now >= this.nextTick && this._len > 0) {
    while(this._i < this._len && this.running) {
      timeEvent = this.events[this._i];
      if(this._now >= timeEvent.tick && !timeEvent.pendingDelete) {
        // (now + delay) - (time difference from last tick to now)
        this._newTick = (this._now + timeEvent.delay) - (this._now - timeEvent.tick);

        if(this._newTick < 0) {
          this._newTick = this._now + timeEvent.delay;
        }

        if(timeEvent.loop === true) {
          timeEvent.tick = this._newTick;
          timeEvent.callback.apply(timeEvent.callbackContext, timeEvent.args);
        } else if(timeEvent.repeatCount > 0) {
          timeEvent.repeatCount--;
          timeEvent.tick = this._newTick;
          timeEvent.callback.apply(timeEvent.callbackContext, timeEvent.args);
        } else {
          this._marked++;
          timeEvent.pendingDelete = true;
          timeEvent.callback.apply(timeEvent.callbackContext, timeEvent.args);
        }

        this._i++;
      } else {
        break;
      }
    }

    // Are there any events left?
    if(this.events.length > this._marked) {
      this.order();
    } else {
      this.expired = true;
      this.emit('complete', this);
    }
  }

  if(this.expired && this.autoDestroy) {
    return false;
  } else {
    return true;
  }
};

Timer.prototype.pause = function() {
  if(!this.running) { return; }

  this._codePaused = true;

  if(this.paused) { return; }

  this._pauseStarted = this.game.clock.time;
  this.paused = true;
};

Timer.prototype._pause = function() {
  if(this.paused || !this.running) { return; }

  this._pauseStarted = this.game.clock.time;
  this.paused = true;
};

Timer.prototype.adjustEvents = function(baseTime) {
  for(var i = 0; i < this.events.length; i++) {
    if(!this.events[i].pendingDelete) {
      // Work out how long there would have been from when the game paused until the events next tick
      var t = this.events[i].tick - baseTime;

      if(t < 0) { t = 0; }

      // Add the difference on to the time now
      this.events[i].tick = this._now + t;
    }
  }

  var d = this.nextTick - baseTime;
  if(d < 0) {
    this.nextTick = this._now;
  } else {
    this.nextTick = this._now + d;
  }
};

Timer.prototype.resume = function() {
  if(!this.paused) { return; }

  var now = this.game.clock.time;
  this._pauseTotal += now - this._now;
  this._now = now;

  this.adjustEvents(this._pauseStarted);

  this.paused = false;
  this._codePaused = false;
};

Timer.prototype._resume = function() {
  if(this._codePaused) {
    return;
  } else {
    this.resume();
  }
};

Timer.prototype.removeAll = function() {
  this.removeAllListeners();
  this.events.length = 0;
  this._len = 0;
  this._i = 0;
};

Timer.prototype.destroy = function() {
  this.removeAllListeners();
  this.running = false;
  this.events = [];
  this._len = 0;
  this._i = 0;
};

Object.defineProperty(Timer.prototype, 'next', {
  get: function() {
    return this.nextTick;
  }
});

Object.defineProperty(Timer.prototype, 'duration', {
  get: function() {
    if(this.running && this.nextTick > this._now) {
      return this.nextTick - this._now;
    } else {
      return 0;
    }
  }
});

Object.defineProperty(Timer.prototype, 'length', {
  get: function() {
    return this.events.length;
  }
});

Object.defineProperty(Timer.prototype, 'ms', {
  get: function() {
    if(this.running) {
      return this._now - this._started - this._pauseTotal;
    } else {
      return 0;
    }
  }
});

Object.defineProperty(Timer.prototype, 'seconds', {
  get: function() {
    if(this.running) {
      return this.ms * 0.001;
    } else {
      return 0;
    }
  }
});

module.exports = Timer;
