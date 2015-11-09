
function TimerEvent(timer, delay, tick, repeatCount, loop, callback, callbackContext, args) {
  this.timer = timer;
  this.delay = delay;
  this.tick = tick;
  this.repeatCount = repeatCount - 1;
  this.loop = loop;
  this.callback = callback;
  this.callbackContext = callbackContext;
  this.args = args;
  this.pendingDelete = false;
};

TimerEvent.prototype.constructor = TimerEvent;

module.exports = TimerEvent;
