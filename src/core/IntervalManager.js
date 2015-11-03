
function IntervalManager(game) {
  this.game = game;
  this.isRunning = false;

  this._startTime = 0;
  this._endTime = 0;

  this._onLoop = null;
  this._onUpdate = null;
  this._immediateID = null;
};

IntervalManager.prototype.constructor = IntervalManager;

IntervalManager.prototype.start = function() {
  var self = this;
  this._onLoop = function() {
    return self.updateImmediate();
  };
  this._immediateID = global.setImmediate(this._onLoop);
};

IntervalManager.prototype.stop = function() {
  this.isRunning = false;
  global.clearImmediate(this._immediateID);
};

IntervalManager.prototype.updateImmediate = function() {
  this._endTime = global.Date.now();
  this.game.update(this._endTime - this._startTime);
  this._immediateID = global.setImmediate(this._onLoop);
  this._startTime = global.Date.now();
};

module.exports = IntervalManager;
