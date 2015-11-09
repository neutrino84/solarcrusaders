
var EventEmitter = require('eventemitter3');

function Animation(game, parent, frameData, frameRate, loop) {
  if(loop === undefined) { loop = false; }

  this.game = game;

  this._parent = parent;
  this._frameData = frameData;

  this.delay = 1000 / frameRate;
  this.loop = loop;
  this.loopCount = 0;

  this.isFinished = false;
  this.isPlaying = false;

  this._frameIndex = 0;
  this._frameDiff = 0;
  this._frameSkip = 1;

  EventEmitter.call(this);
};

Animation.prototype = Object.create(EventEmitter.prototype);
Animation.prototype.constructor = Animation;

Animation.prototype.play = function(frameRate, loop) {
  if(typeof frameRate === 'number') { this.delay = 1000 / frameRate; }
  if(typeof loop === 'boolean') { this.loop = loop; }

  this.isPlaying = true;
  this.isFinished = false;
  this.loopCount = 0;

  this._frameIndex = 0;
  this._timeLastFrame = this.game.clock.time;
  this._timeNextFrame = this.game.clock.time + this.delay;

  this.updateCurrentFrame();

  this.emit('start', this);
};

Animation.prototype.restart = function() {
  this.isPlaying = true;
  this.isFinished = false;
  this.loopCount = 0;

  this._frameIndex = 0;
  this._timeLastFrame = this.game.clock.time;
  this._timeNextFrame = this.game.clock.time + this.delay;

  this.updateCurrentFrame();

  this.emit('start', this);
};

Animation.prototype.reset = function() {
  this._frameIndex = 0;
  this.currentFrame = this._frameData[this._frameIndex];
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
  if(this.isPlaying && this.game.clock.time >= this._timeNextFrame) {
    this._frameSkip = 1;

    // lagging?
    this._frameDiff = this.game.clock.time - this._timeNextFrame;
    this._timeLastFrame = this.game.clock.time;

    if(this._frameDiff > this.delay) {
      // we need to skip a frame, work out how many
      this._frameSkip = global.Math.floor(this._frameDiff / this.delay);
      this._frameDiff -= (this._frameSkip * this.delay);
    }

    // and what's left now?
    this._timeNextFrame = this.game.clock.time + (this.delay - this._frameDiff);
    this._frameIndex += this._frameSkip;

    if(this._frameIndex >= this._frameData.length) {
      if(this.loop) {
        this._frameIndex %= this._frameData.length;
        this.updateCurrentFrame();
        this.loopCount++;
        this.emit('loop', this);

        return true;
      } else {
        this.complete();

        return false;
      }
    } else {
      return this.updateCurrentFrame();
    }
  }

  return false;
};

Animation.prototype.updateCurrentFrame = function() {
  if(!this._frameData) { return false; }
  
  var property, frame;

  this.currentFrame = this._frameData[this._frameIndex];
  
  // update parent
  if(this.currentFrame) {
    for(property in this.currentFrame) {
      frame = this.currentFrame[property];
      this._parent[property] = frame;
    }
  }
};

Animation.prototype.destroy = function() {
  if(!this._frameData) { return; }

  this.game = null;
  this._parent = null;
  this._frameData = null;
  this.currentFrame = null;
  this.isPlaying = false;
};

Animation.prototype.complete = function() {
  this._frameIndex = this._frameData.length - 1;
  this.currentFrame = this._frameData[this._frameIndex];

  this.isPlaying = false;
  this.isFinished = true;

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

Object.defineProperty(Animation.prototype, 'speed', {
  get: function() {
    return Math.round(1000 / this.delay);
  },

  set: function(value) {
    if(value >= 1) {
      this.delay = 1000 / value;
    }
  }
});

module.exports = Animation;
