
function RequestAnimationFrame(game, forceTimeout) {
  if(forceTimeout === undefined) { forceTimeout = false; }

  this.game = game;
  this.isRunning = false;
  this.forceTimeout = forceTimeout;

  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x=0; x<vendors.length && !global.requestAnimationFrame; x++) {
    global.requestAnimationFrame = global[vendors[x] + 'RequestAnimationFrame'];
    global.cancelAnimationFrame = global[vendors[x] + 'CancelAnimationFrame'];
  }

  this._isSetTimeOut = false;
  this._onLoop = null;
  this._timeOutID = null;
};

RequestAnimationFrame.prototype.constructor = RequestAnimationFrame;

RequestAnimationFrame.prototype.start = function() {
  var self = this;

  this.isRunning = true;

  if(!global.requestAnimationFrame || this.forceTimeout) {
    this._isSetTimeOut = true;

    this._onLoop = function() {
      return self.updateSetTimeout();
    };

    this._timeOutID = global.setTimeout(this._onLoop, 0);
  } else {
    this._isSetTimeOut = false;

    this._onLoop = function(time) {
      return self.updateRequestAnimationFrame(time);
    };

    this._timeOutID = global.requestAnimationFrame(this._onLoop);
  }
};

RequestAnimationFrame.prototype.updateRequestAnimationFrame = function(rafTime) {
  this.game.update(Math.floor(rafTime));
  this._timeOutID = global.requestAnimationFrame(this._onLoop);
};

RequestAnimationFrame.prototype.updateSetTimeout = function() {
  this.game.update(Date.now());
  this._timeOutID = global.setTimeout(this._onLoop, this.game.clock.timeToCall);
};

RequestAnimationFrame.prototype.stop = function() {
  this.isRunning = false;

  if(this._isSetTimeOut) {
    clearTimeout(this._timeOutID);
  } else {
    global.cancelAnimationFrame(this._timeOutID);
  }
};

RequestAnimationFrame.prototype.isSetTimeOut = function() {
  return this._isSetTimeOut;
};

module.exports = RequestAnimationFrame;
