
function IntervalManager(game) {
  this.game = game;
  this.isRunning = false;

  this._startTime = 0;
  this._endTime = 0;

  this._onLoop = null;
  this._onUpdate = null;
  this._timeoutID = null;
};

IntervalManager.prototype.constructor = IntervalManager;

IntervalManager.prototype.start = function() {
  var self = this;
  this._onLoop = function() {
    return self.updateImmediate();
  };
  this._timeoutID = global.setTimeout(this._onLoop, 0);
};

IntervalManager.prototype.stop = function() {
  this.isRunning = false;
  global.clearTimeout(this._timeoutID);
};

IntervalManager.prototype.updateImmediate = function() {
  this._endTime = global.Date.now();
  this.game.update(this._endTime - this._startTime);
  this._timeoutID = global.setTimeout(this._onLoop, 0);
  this._startTime = global.Date.now();
};

module.exports = IntervalManager;
