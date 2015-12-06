
var EventEmitter = require('eventemitter3');

function Animation(game, parent, name, frameData, frames, frameRate, loop) {
  if(loop === undefined) { loop = false; }

  this.game = game;
  this.name = name;
  this.parent = parent;

  this._frameData = frameData;
  this._frames = [];
  this._frames = this._frames.concat(frames);

  this.delay = 1000 / frameRate;
  this.loop = loop;
  this.loopCount = 0;

  this.killOnComplete = false;
  this.isFinished = false;
  this.isPlaying = false;
  this.isPaused = false;

  this._pauseStartTime = 0;
  this._frameIndex = 0;
  this._frameDiff = 0;
  this._frameSkip = 1;

  this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]);

  ////  Set-up some event listeners
  // this.game.on('pause', this.onPause, this);
  // this.game.on('resume', this.onResume, this);

  EventEmitter.call(this);
};

Animation.prototype = Object.create(EventEmitter.prototype);
Animation.prototype.constructor = Animation;

Animation.prototype.play = function(frameRate, loop, killOnComplete) {
  if(typeof frameRate === 'number') {
    // if they set a new frame rate then use it, otherwise use the one set on creation
    this.delay = 1000 / frameRate;
  }

  if(typeof loop === 'boolean') {
    // if they set a new loop value then use it, otherwise use the one set on creation
    this.loop = loop;
  }

  if(killOnComplete !== undefined) {
    // remove the parent sprite once the animation has finished?
    this.killOnComplete = killOnComplete;
  }

  this.isPlaying = true;
  this.isFinished = false;
  this.paused = false;
  this.loopCount = 0;

  this._timeLastFrame = this.game.clock.time;
  this._timeNextFrame = this.game.clock.time + this.delay;

  this._frameIndex = 0;
  this.updateCurrentFrame(true);

  this.emit('start', this.parent, this);

  this.parent.emit('animationStart', this);
  this.parent.animations.currentAnim = this;
  this.parent.animations.currentFrame = this.currentFrame;

  return this;
};

Animation.prototype.restart = function() {
  this.isPlaying = true;
  this.isFinished = false;
  this.paused = false;
  this.loopCount = 0;

  this._timeLastFrame = this.game.clock.time;
  this._timeNextFrame = this.game.clock.time + this.delay;

  this._frameIndex = 0;

  this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]);

  this.parent.setFrame(this.currentFrame);

  this.emit('start', this.parent, this);

  this.parent.emit('animationStart', this);
  this.parent.animations.currentAnim = this;
  this.parent.animations.currentFrame = this.currentFrame;
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
  this.isFinished = true;
  this.paused = false;

  if(resetFrame) {
    this.currentFrame = this._frameData.getFrame(this._frames[0]);
    this.parent.setFrame(this.currentFrame);
  }

  if(dispatchComplete) {
    this.parent.emit('animationComplete', this);
    this.emit('complete', this.parent, this);
  }
};

Animation.prototype.onPause = function() {
  if(this.isPlaying) {
    this._frameDiff = this._timeNextFrame - this.game.clock.time;
  }
};

Animation.prototype.onResume = function() {
  if(this.isPlaying) {
    this._timeNextFrame = this.game.clock.time + this._frameDiff;
  }
};

Animation.prototype.update = function() {
  if(this.isPaused) { return false; }

  if(this.isPlaying && this.game.clock.time >= this._timeNextFrame) {
    this._frameSkip = 1;

    //  Lagging?
    this._frameDiff = this.game.clock.time - this._timeNextFrame;
    this._timeLastFrame = this.game.clock.time;

    if(this._frameDiff > this.delay) {
      //  We need to skip a frame, work out how many
      this._frameSkip = Math.floor(this._frameDiff / this.delay);
      this._frameDiff -= (this._frameSkip * this.delay);
    }

    //  And what's left now?
    this._timeNextFrame = this.game.clock.time + (this.delay - this._frameDiff);
    this._frameIndex += this._frameSkip;

    if(this._frameIndex >= this._frames.length) {
      if(this.loop) {
        // Update current state before event callback
        this._frameIndex %= this._frames.length;
        this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]);

        //  Instead of calling updateCurrentFrame we do it here instead
        if(this.currentFrame) {
          this.parent.setFrame(this.currentFrame);
        }

        this.loopCount++;

        // dispatch events
        // this.parent.emit('animationLoop', this);
        // this.emit('loop', this.parent, this);

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

Animation.prototype.updateCurrentFrame = function(fromPlay) {
  if(fromPlay === undefined) { fromPlay = false; }

  if(!this._frameData) {
    // the animation is already destroyed, probably from a callback
    return false;
  }

  // previous index
  var idx = this.currentFrame.index;

  this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]);

  if(this.currentFrame && (fromPlay || (!fromPlay && idx !== this.currentFrame.index))) {
    this.parent.setFrame(this.currentFrame);
  }

  return true;
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

  // this.game.removeListener('pause', this.onPause, this);
  // this.game.removeListener('resume', this.onResume, this);

  this.game = null;
  this.parent = null;
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
  this.isFinished = true;
  this.paused = false;

  this.parent.on('animationComplete', this);
  this.on('complete', this.parent, this);

  if(this.killOnComplete) {
    this.parent.kill();
  }
};

Object.defineProperty(Animation.prototype, 'paused', {
  get: function() {
    return this.isPaused;
  },

  set: function(value) {
    this.isPaused = value;
    if(value) {
      //  Paused
      this._pauseStartTime = this.game.clock.time;
    } else {
      //  Un-paused
      if(this.isPlaying) {
        this._timeNextFrame = this.game.clock.time + this.delay;
      }
    }
  }
});

Object.defineProperty(Animation.prototype, 'frameTotal', {
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
      this.parent.setFrame(this.currentFrame);
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
