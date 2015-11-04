
function Timeout(game) {
  this.game = game;
  this.isRunning = false;

  this._startTime = 0;
  this._endTime = 0;

  this._onLoop = null;
  this._onUpdate = null;
  this._timeoutID = null;
};

Timeout.prototype.constructor = Timeout;

Timeout.prototype.init = function() {
  
};

Timeout.prototype.start = function() {
  var self = this;
  this._onLoop = function() {
    return self.update();
  };
  this._timeoutID = global.setTimeout(this._onLoop, 0);
};

Timeout.prototype.stop = function() {
  this.isRunning = false;
  global.clearTimeout(this._timeoutID);
};

Timeout.prototype.update = function() {
  this._endTime = global.Date.now();

  this.game.update(this._endTime - this._startTime);

  this._timeoutID = global.setTimeout(this._onLoop, 0);
  this._startTime = global.Date.now();
};

module.exports = Timeout;
