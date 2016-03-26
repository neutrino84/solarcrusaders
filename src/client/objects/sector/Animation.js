
var EventEmitter = require('eventemitter3');

function Animation(game, parent, delay) {
  if(delay === undefined) { delay = 0; }

  this.game = game;
  this.parent = parent;

  this.lastFrame = undefined;
  this.currentFrame = undefined;

  this.isFinished = false;
  this.isPlaying = false;

  this._paths = [];
  this._delay = delay;

  this._duration = 0;
  this._startTime = 0;
  this._endTime = 0;
  this._currentTime = 0;
  this._frameIndex = 0;

  EventEmitter.call(this);
};

Animation.prototype = Object.create(EventEmitter.prototype);
Animation.prototype.constructor = Animation;

Animation.prototype.play = function(delay, paths) {
  if(delay !== undefined) { this._delay = delay; }

  this.isPlaying = true;
  this.isFinished = false;

  this._paths = paths;
  this._frameIndex = 0;

  this._duration = this._paths[this._frameIndex].duration;
  this._startTime = this.game.clock.time + this._delay;
  this._endTime = this.game.clock.time + this._duration + this._delay;
  this._currentTime = 0;
  
  this.updateCurrentFrame(0.0);

  this.emit('start', this);
};

Animation.prototype.stop = function(silent) {
  if(silent === undefined) { silent = false; }

  this.isPlaying = false;
  this.isFinished = true;

  if(!silent) {
    this.emit('complete', this);
  }
};

Animation.prototype.update = function() {
  var path, index, length, offset,
      time = this.game.clock.time;
  if(this.isPlaying && time >= this._startTime) {
    this._currentTime = time - this._startTime;
    percent = global.Math.max(0.0, this._currentTime / this._duration);
    if(percent < 1.0) {
      this.updateCurrentFrame(percent);
    } else if(this._frameIndex < this._paths.length - 1) {
      offset = time - this._endTime;
      this._frameIndex++;
      this._duration = this._paths[this._frameIndex].duration;
      this._startTime = time - offset;
      this._endTime = time + this._duration - offset;
      this._currentTime = time - this._startTime;
      this.updateCurrentFrame(
        this._currentTime / this._duration
      );
    } else {
      this.complete();
    }
  }
};

Animation.prototype.updateCurrentFrame = function(percent) {
  var path, value, interpolated, point, distance,
      parent = this.parent;

  // compute position
  path = this._paths[this._frameIndex];
  value = path.easing(percent);
  interpolated = path.start + ((path.end - path.start) * value);
  point = path.interpolate(parent.movement, interpolated);

  this.lastFrame = this.currentFrame;
  this.currentFrame = { x: point.x, y: point.y };
  
  parent.interpolate(this.currentFrame, 0.05, parent.position);
};

Animation.prototype.destroy = function() {
  // if(!this._paths) { return; }
  this.removeAllListeners();
  this.isPlaying = false;
  this.game = this.parent = this._paths =
    this.lastFrame = this.currentFrame = undefined;
};

Animation.prototype.complete = function() {
  this._frameIndex = this._paths.length - 1;

  this.isPlaying = false;
  this.isFinished = true;

  this.updateCurrentFrame(1.0);

  this.emit('complete', this);
};

Object.defineProperty(Animation.prototype, 'frameIndex', {
  get: function() {
    return this._frameIndex;
  }
});

Object.defineProperty(Animation.prototype, 'frameTotal', {
  get: function() {
    return this._paths.length;
  }
});

module.exports = Animation;
