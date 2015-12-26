
var EventEmitter = require('eventemitter3');

function Animation(game, parent, frameData, duration, delay, loop) {
  if(frameData === undefined) { frameData = []; }
  if(duration === undefined) { duration = 0; }
  if(delay === undefined) { delay = 0; }
  if(loop === undefined) { loop = false; }

  this.game = game;

  this._parent = parent;
  this._frameData = frameData;
  this._duration = duration;
  this._delay = delay;
  this._startTime = 0;
  this._endTime = 0;
  this._currentTime = 0;
  
  this.loop = loop;
  this.loopCount = 0;

  this.isFinished = false;
  this.isPlaying = false;

  this._frameIndex = 0;
  this._lastIndex = 0;

  EventEmitter.call(this);
};

Animation.prototype = Object.create(EventEmitter.prototype);
Animation.prototype.constructor = Animation;

Animation.prototype.play = function(frameData, duration, delay, loop) {
  if(frameData !== undefined) { this._frameData = frameData; }
  if(duration !== undefined) { this._duration = duration; }
  if(delay !== undefined) { this._delay = delay; }
  if(loop !== undefined) { this.loop = loop; }

  this.isPlaying = true;
  this.isFinished = false;
  this.loopCount = 0;

  this._frameIndex = 0;
  this._lastIndex = 0;
  this._currentTime = 0;
  this._startTime = this.game.clock.time + this._delay;
  this._endTime = this.game.clock.time + this._duration;
  
  this.updateCurrentFrame();

  this.emit('start', this);
};

Animation.prototype.replay = function() {
  this.isPlaying = true;
  this.isFinished = false;

  this._frameIndex = 0;
  this._lastIndex = 0;
  this._currentTime = 0;
  this._startTime = this.game.clock.time + this._delay;
  this._endTime = this.game.clock.time + this._duration;
  
  this.updateCurrentFrame();
};

Animation.prototype.reset = function() {
  this._frameIndex = 0;
  this._lastIndex = 0;
  this._startTime = 0;
  this._endTime = 0;
  this._duration = 0;
  this._delay = 0;
  this._frameData = [];
  this._currentTime = 0;

  this.isPlaying = false;
  this.isFinished = false;
  this.loopCount = 0;

  this.updateCurrentFrame();
}

Animation.prototype.stop = function(dispatchComplete) {
  if(dispatchComplete === undefined) { dispatchComplete = false; }

  this.isPlaying = false;
  this.isFinished = true;

  if(dispatchComplete) {
    this.emit('complete', this);
  }
};

Animation.prototype.update = function() {
  if(this.isPlaying && this.game.clock.time >= this._startTime) {

    this._currentTime = this.game.clock.time - this._startTime;
    this._lastIndex = this._frameIndex;
    this._frameIndex = global.Math.floor(this._frameData.length * (this._currentTime / this._duration));

    if(this._frameIndex >= this._frameData.length) {
      if(this.loop) {
        this.loopCount++;
        this.replay();
        this.emit('loop', this);
      } else {
        this.complete();
      }
    } else if(this._lastIndex !== this._frameIndex) {
      this.updateCurrentFrame();
    }
  }
};

Animation.prototype.updateCurrentFrame = function() {
  var property, frame;

  this.currentFrame = this._frameData[this._frameIndex];
  
  // update parent
  if(this.currentFrame) {
    for(property in this.currentFrame) {
      frame = this.currentFrame[property];
      this._parent[property] = frame;
    }
  }// else {
  //  console.log('no frame???');
  //}
};

Animation.prototype.destroy = function() {
  if(!this._frameData) { return; }

  this.isPlaying = false;

  this.game = this._parent = this._frameData =
    this.currentFrame = undefined;
};

Animation.prototype.complete = function() {
  this._frameIndex = this._frameData.length - 1;

  this.isPlaying = false;
  this.isFinished = true;

  this.updateCurrentFrame();

  this.emit('complete', this);
};

Object.defineProperty(Animation.prototype, 'frame', {
  get: function() {
    return this._frameData[this._frameIndex];
  }
});

Object.defineProperty(Animation.prototype, 'lastFrame', {
  get: function() {
    return this._frameData[this._frameIndex-1];
  }
});

Object.defineProperty(Animation.prototype, 'frameIndex', {
  get: function() {
    return this._frameIndex;
  }
});

Object.defineProperty(Animation.prototype, 'frameTotal', {
  get: function() {
    return this._frameData.length;
  }
});

Object.defineProperty(Animation.prototype, 'frameData', {
  get: function() {
    return this._frameData;
  },

  set: function(value) {
    this._frameData = value;
  }
});

module.exports = Animation;
