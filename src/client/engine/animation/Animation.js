
var EventEmitter = require('eventemitter3');

function Animation(game, name, sprite, frameData, frames, frameRate, loop) {
  if(frameRate === undefined) { frameRate = 60; }
  if(loop === undefined) { loop = false; }

  this.game = game;
  this.name = name;
  this.sprite = sprite;

  this._frameData = frameData;
  this._frames = frames;

  this.delay = 1000 / frameRate;
  this.loop = loop;
  this.loopCount = 0;

  this.isPlaying = false;

  this._pauseStartTime = 0;
  this._frameIndex = 0;
  this._frameDiff = 0;
  this._frameSkip = 1;

  this.updateCurrentFrame();

  EventEmitter.call(this);
};

Animation.prototype = Object.create(EventEmitter.prototype);
Animation.prototype.constructor = Animation;

Animation.prototype.play = function(loop, frameRate) {
  if(typeof loop === 'boolean') {
    // if they set a new loop value then use it, otherwise use the one set on creation
    this.loop = loop;
  }

  if(typeof frameRate === 'number') {
    // if they set a new frame rate then use it, otherwise use the one set on creation
    this.delay = 1000 / frameRate;
  }

  this.loopCount = 0;
  this.isPlaying = true;

  this._frameIndex = 0;
  this._timeLastFrame = this.game.clock.time;
  this._timeNextFrame = this.game.clock.time + this.delay;

  this.updateCurrentFrame();
};

Animation.prototype.setFrame = function(frameId, useLocalFrameIndex) {
  var frameIndex;

  if(useLocalFrameIndex === undefined) {
    useLocalFrameIndex = false;
  }

  // find the index to the desired frame.
  if(typeof frameId === 'string') {
    for (var i = 0; i < this._frames.length; i++) {
      if(this._frameData.getFrame(this._frames[i]).name === frameId) {
        frameIndex = i;
      }
    }
  } else if(typeof frameId === 'number') {
    if(useLocalFrameIndex) {
      frameIndex = frameId;
    } else {
      for (var i = 0; i < this._frames.length; i++) {
        if(this._frames[i] === frameIndex) {
          frameIndex = i;
        }
      }
    }
  }

  if(frameIndex) {
    // set the current frame index to the found index.
    // subtract 1 so that it animates to the desired frame on update.
    this._frameIndex = frameIndex - 1;

    // make the animation update at next update
    this._timeNextFrame = this.game.clock.time;

    this.update();
  }
};

Animation.prototype.stop = function(resetFrame, dispatchComplete) {
  if(resetFrame === undefined) { resetFrame = false; }
  if(dispatchComplete === undefined) { dispatchComplete = false; }

  this.isPlaying = false;

  if(resetFrame) {
    this._frameIndex = 0;
    this.updateCurrentFrame();
  }

  if(dispatchComplete) {
    //..
  }
};

Animation.prototype.update = function() {
  var time = this.game.clock.time;
  if(this.isPlaying && time >= this._timeNextFrame) {
    this._frameSkip = 1;

    // lag control
    this._frameDiff = time - this._timeNextFrame;
    this._timeLastFrame = time;

    if(this._frameDiff > this.delay) {
      // need to skip frames
      this._frameSkip = global.Math.floor(this._frameDiff / this.delay);
      this._frameDiff -= this._frameSkip * this.delay;
    }

    // calculate next time
    this._timeNextFrame = time + (this.delay - this._frameDiff);
    this._frameIndex += this._frameSkip;

    // update, loop, or complete
    if(this._frameIndex >= this._frames.length) {
      if(this.loop) {
        this.loopCount++;
        this._frameIndex %= this._frames.length;
        this.updateCurrentFrame();
      } else {
        this.complete();
      }
    } else {
      this.updateCurrentFrame();
    }
  }
};

Animation.prototype.updateCurrentFrame = function() {
  this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]);
  this.sprite.setFrame(this.currentFrame);
};

Animation.prototype.next = function(quantity) {
  if(quantity === undefined) { quantity = 1; }

  var frame = this._frameIndex + quantity;
  if(frame >= this._frames.length) {
    if(this.loop) {
      frame %= this._frames.length;
    } else {
      frame = this._frames.length - 1;
    }
  }

  if(frame !== this._frameIndex) {
    this._frameIndex = frame;
    this.updateCurrentFrame();
  }
};

Animation.prototype.previous = function(quantity) {
  if(quantity === undefined) { quantity = 1; }

  var frame = this._frameIndex - quantity;
  if(frame < 0) {
    if(this.loop) {
      frame = this._frames.length + frame;
    } else {
      frame++;
    }
  }

  if(frame !== this._frameIndex) {
    this._frameIndex = frame;
    this.updateCurrentFrame();
  }
};

Animation.prototype.updateFrameData = function(frameData) {
  this._frameData = frameData;
  this.currentFrame = this._frameData ? this._frameData.getFrame(this._frames[this._frameIndex % this._frames.length]) : null;
};

Animation.prototype.destroy = function() {
  if(!this._frameData) { return; }

  this.game = null;
  this.sprite = null;
  this._frames = null;
  this._frameData = null;
  this.currentFrame = null;
  this.isPlaying = false;

  this.removeAllListeners();
};

Animation.prototype.complete = function() {
  this._frameIndex = this._frames.length - 1;
  this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]);

  this.isPlaying = false;
};

Object.defineProperty(Animation.prototype, 'total', {
  get: function() {
    return this._frames.length;
  }
});

Object.defineProperty(Animation.prototype, 'frame', {
  get: function() {
    if(this.currentFrame !== null) {
      return this.currentFrame.index;
    } else {
      return this._frameIndex;
    }
  },

  set: function(value) {
    this.currentFrame = this._frameData.getFrame(this._frames[value]);

    if(this.currentFrame !== null) {
      this._frameIndex = value;
      this.sprite.setFrame(this.currentFrame);
    }
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

Animation.generateFrameNames = function(prefix, start, stop, suffix) {
  if(suffix === undefined) { suffix = ''; }

  var output = [];
  var frame = '';
  if(start < stop) {
    for (var i = start; i <= stop; i++) {
      frame = prefix + i.toString() + suffix;
      output.push(frame);
    }
  } else {
    for (var i = start; i >= stop; i--) {
      frame = prefix + i.toString() + suffix;
      output.push(frame);
    }
  }

  return output;
};

module.exports = Animation;
