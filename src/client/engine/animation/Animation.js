
function Animation(game, parent, name, frameData, frames, frameRate, loop) {
  if(loop === undefined) { loop = false; }

  this.game = game;
  this.name = name;

  this._parent = parent;
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

  // this.onStart = new Phaser.Signal();
  // this.onUpdate = null;
  // this.onComplete = new Phaser.Signal();
  // this.onLoop = new Phaser.Signal();

  //  Set-up some event listeners
  // this.game.onPause.add(this.onPause, this);
  // this.game.onResume.add(this.onResume, this);
};

Animation.prototype = {

  play: function(frameRate, loop, killOnComplete) {
    if(typeof frameRate === 'number') {
      //  If they set a new frame rate then use it, otherwise use the one set on creation
      this.delay = 1000 / frameRate;
    }

    if(typeof loop === 'boolean') {
      //  If they set a new loop value then use it, otherwise use the one set on creation
      this.loop = loop;
    }

    if(killOnComplete !== undefined) {
      //  Remove the parent sprite once the animation has finished?
      this.killOnComplete = killOnComplete;
    }

    this.isPlaying = true;
    this.isFinished = false;
    this.paused = false;
    this.loopCount = 0;

    this._timeLastFrame = this.game.clock.time;
    this._timeNextFrame = this.game.clock.time + this.delay;

    this._frameIndex = 0;
    this.updateCurrentFrame(false, true);

    // this._parent.events.onAnimationStart$dispatch(this._parent, this);

    // this.onStart.dispatch(this._parent, this);

    this._parent.animations.currentAnim = this;
    this._parent.animations.currentFrame = this.currentFrame;

    return this;
  },

  restart: function() {
    this.isPlaying = true;
    this.isFinished = false;
    this.paused = false;
    this.loopCount = 0;

    this._timeLastFrame = this.game.clock.time;
    this._timeNextFrame = this.game.clock.time + this.delay;

    this._frameIndex = 0;

    this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]);

    this._parent.setFrame(this.currentFrame);

    this._parent.animations.currentAnim = this;
    this._parent.animations.currentFrame = this.currentFrame;

    // this.onStart.dispatch(this._parent, this);
  },

  setFrame: function(frameId, useLocalFrameIndex) {
    var frameIndex;

    if(useLocalFrameIndex === undefined) {
      useLocalFrameIndex = false;
    }

    //  Find the index to the desired frame.
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
      //  Set the current frame index to the found index. Subtract 1 so that it animates to the desired frame on update.
      this._frameIndex = frameIndex - 1;

      //  Make the animation update at next update
      this._timeNextFrame = this.game.clock.time;

      this.update();
    }
  },

  stop: function(resetFrame, dispatchComplete) {
    if(resetFrame === undefined) { resetFrame = false; }
    if(dispatchComplete === undefined) { dispatchComplete = false; }

    this.isPlaying = false;
    this.isFinished = true;
    this.paused = false;

    if(resetFrame) {
      this.currentFrame = this._frameData.getFrame(this._frames[0]);
      this._parent.setFrame(this.currentFrame);
    }

    if(dispatchComplete) {
      // this._parent.events.onAnimationComplete$dispatch(this._parent, this);
      // this.onComplete.dispatch(this._parent, this);
    }
  },

  onPause: function() {
    if(this.isPlaying) {
      this._frameDiff = this._timeNextFrame - this.game.clock.time;
    }
  },

  onResume: function() {
    if(this.isPlaying) {
      this._timeNextFrame = this.game.clock.time + this._frameDiff;
    }
  },

  update: function() {
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
            this._parent.setFrame(this.currentFrame);
          }

          this.loopCount++;
          // this._parent.events.onAnimationLoop$dispatch(this._parent, this);
          // this.onLoop.dispatch(this._parent, this);

          if(this.onUpdate) {
            // this.onUpdate.dispatch(this, this.currentFrame);

            // False ifthe animation was destroyed from within a callback
            return !!this._frameData;
          } else {
            return true;
          }
        } else {
          this.complete();
          return false;
        }
      } else {
        return this.updateCurrentFrame(true);
      }
    }

    return false;
  },

  updateCurrentFrame: function(signalUpdate, fromPlay) {
    if(fromPlay === undefined) { fromPlay = false; }

    if(!this._frameData) {
      // The animation is already destroyed, probably from a callback
      return false;
    }
        
    //  Previous index
    var idx = this.currentFrame.index;

    this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]);

    if(this.currentFrame && (fromPlay || (!fromPlay && idx !== this.currentFrame.index))) {
      this._parent.setFrame(this.currentFrame);
    }

    if(this.onUpdate && signalUpdate) {
      // this.onUpdate.dispatch(this, this.currentFrame);

      // False ifthe animation was destroyed from within a callback
      return !!this._frameData;
    } else {
      return true;
    }
  },

  next: function(quantity) {
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
      this.updateCurrentFrame(true);
    }
  },

  previous: function(quantity) {
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
      this.updateCurrentFrame(true);
    }
  },

  updateFrameData: function(frameData) {
    this._frameData = frameData;
    this.currentFrame = this._frameData ? this._frameData.getFrame(this._frames[this._frameIndex % this._frames.length]) : null;
  },

  destroy: function() {
    if(!this._frameData) {
      // Already destroyed
      return;
    }

    // this.game.onPause.remove(this.onPause, this);
    // this.game.onResume.remove(this.onResume, this);

    this.game = null;
    this._parent = null;
    this._frames = null;
    this._frameData = null;
    this.currentFrame = null;
    this.isPlaying = false;

    // this.onStart.dispose();
    // this.onLoop.dispose();
    // this.onComplete.dispose();

    // if(this.onUpdate) {
    //   this.onUpdate.dispose();
    // }
  },

  complete: function() {
    this._frameIndex = this._frames.length - 1;
    this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]);

    this.isPlaying = false;
    this.isFinished = true;
    this.paused = false;

    // this._parent.events.onAnimationComplete$dispatch(this._parent, this);

    // this.onComplete.dispatch(this._parent, this);

    if(this.killOnComplete) {
      this._parent.kill();
    }
  }
};

Animation.prototype.constructor = Animation;

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
      this._parent.setFrame(this.currentFrame);

      if(this.onUpdate) {
        // this.onUpdate.dispatch(this, this.currentFrame);
      }
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

Object.defineProperty(Animation.prototype, 'enableUpdate', {
  get: function() {
    return (this.onUpdate !== null);
  },

  set: function(value) {
    if(value && this.onUpdate === null) {
      this.onUpdate = new Phaser.Signal();
    } else if(!value && this.onUpdate !== null) {
      this.onUpdate.dispose();
      this.onUpdate = null;
    }
  }
});

Animation.generateFrameNames = function(prefix, start, stop, suffix, zeroPad) {
  if(suffix === undefined) { suffix = ''; }

  var output = [];
  var frame = '';
  if(start < stop) {
    for (var i = start; i <= stop; i++) {
      if(typeof zeroPad === 'number') {
        //  str, len, pad, dir
        frame = Phaser.Utils.pad(i.toString(), zeroPad, '0', 1);
      } else {
        frame = i.toString();
      }

      frame = prefix + frame + suffix;
      output.push(frame);
    }
  } else {
    for (var i = start; i >= stop; i--) {
      if(typeof zeroPad === 'number') {
        //  str, len, pad, dir
        frame = Phaser.Utils.pad(i.toString(), zeroPad, '0', 1);
      } else {
        frame = i.toString();
      }

      frame = prefix + frame + suffix;
      output.push(frame);
    }
  }

  return output;
};

module.exports = Animation;
