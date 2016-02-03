var Animation = require('./Animation');

function AnimationManager(sprite) {
  this.sprite = sprite;
  this.game = sprite.game;

  this.currentFrame = null;
  this.currentAnim = null;
  this.updateIfVisible = true;
  this.isLoaded = false;

  this._frameData = null;
  this._anims = {};
  this._outputFrames = [];
};

AnimationManager.prototype = {

  loadFrameData: function(frameData, frame) {
    if(frameData === undefined) {
      return false;
    }

    if(this.isLoaded) {
      // We need to update the frameData that the animations are using
      for(var anim in this._anims) {
        this._anims[anim].updateFrameData(frameData);
      }
    }

    this._frameData = frameData;

    if(frame === undefined || frame === null) {
      this.frame = 0;
    } else {
      if(typeof frame === 'string') {
        this.frameName = frame;
      } else {
        this.frame = frame;
      }
    }

    this.isLoaded = true;

    return true;
  },

  copyFrameData: function(frameData, frame) {
    this._frameData = frameData.clone();

    if(this.isLoaded) {
      // We need to update the frameData that the animations are using
      for(var anim in this._anims) {
        this._anims[anim].updateFrameData(this._frameData);
      }
    }

    if(frame === undefined || frame === null) {
      this.frame = 0;
    } else {
      if(typeof frame === 'string') {
        this.frameName = frame;
      } else {
        this.frame = frame;
      }
    }

    this.isLoaded = true;

    return true;
  },

  add: function(name, frames, frameRate, loop, useNumericIndex) {
    frames = frames || [];
    frameRate = frameRate || 60;

    if(loop === undefined) { loop = false; }

    //  If they didn't set the useNumericIndex then let's at least try and guess it
    if(useNumericIndex === undefined) {
      if(frames && typeof frames[0] === 'number') {
        useNumericIndex = true;
      } else {
        useNumericIndex = false;
      }
    }

    this._outputFrames = [];
    this._frameData.getFrameIndexes(frames, useNumericIndex, this._outputFrames);
    this._anims[name] = new Animation(this.game, this.sprite, name, this._frameData, this._outputFrames, frameRate, loop);

    this.currentAnim = this._anims[name];

    //  This shouldn't be set until the Animation is played, surely?
    // this.currentFrame = this.currentAnim.currentFrame;

    if(this.sprite.tilingTexture) {
      this.sprite.refreshTexture = true;
    }

    return this._anims[name];
  },

  validateFrames: function(frames, useNumericIndex) {
    if(useNumericIndex === undefined) { useNumericIndex = true; }

    for(var i = 0; i < frames.length; i++) {
      if(useNumericIndex === true) {
        if(frames[i] > this._frameData.total) {
          return false;
        }
      } else {
        if(this._frameData.checkFrameName(frames[i]) === false) {
          return false;
        }
      }
    }

    return true;
  },

  play: function(name, frameRate, loop, killOnComplete) {
      if(this._anims[name]) {
        if(this.currentAnim === this._anims[name]) {
          if(this.currentAnim.isPlaying === false) {
            this.currentAnim.paused = false;
            return this.currentAnim.play(frameRate, loop, killOnComplete);
          }

          return this.currentAnim;
        } else {
          if(this.currentAnim && this.currentAnim.isPlaying) {
            this.currentAnim.stop();
          }

          this.currentAnim = this._anims[name];
          this.currentAnim.paused = false;
          this.currentFrame = this.currentAnim.currentFrame;

          return this.currentAnim.play(frameRate, loop, killOnComplete);
        }
      }
  },

  stop: function(name, resetFrame) {
    if(resetFrame === undefined) { resetFrame = false; }

    if(this.currentAnim && (typeof name !== 'string' || name === this.currentAnim.name)) {
      this.currentAnim.stop(resetFrame);
    }
  },

  update: function() {
    if(this.updateIfVisible && !this.sprite.visible) {
      return false;
    }

    if(this.currentAnim && this.currentAnim.update()) {
      this.currentFrame = this.currentAnim.currentFrame;
      return true;
    }

    return false;
  },

  next: function(quantity) {
    if(this.currentAnim) {
      this.currentAnim.next(quantity);
      this.currentFrame = this.currentAnim.currentFrame;
    }
  },

  previous: function(quantity) {
    if(this.currentAnim) {
      this.currentAnim.previous(quantity);
      this.currentFrame = this.currentAnim.currentFrame;
    }
  },

  getAnimation: function(name) {
    if(typeof name === 'string') {
      if(this._anims[name]) {
        return this._anims[name];
      }
    }

    return null;
  },

  refreshFrame: function() {
    //  TODO
    // this.sprite.setTexture(PIXI.TextureCache[this.currentFrame.uuid]);
    console.warn('refreshFrame is not implemented, see engine/animation/AnimationManager');
  },

  destroy: function() {
    var anim = null;

    for(var anim in this._anims) {
        if(this._anims.hasOwnProperty(anim)) {
            this._anims[anim].destroy();
        }
    }

    this._anims = {};
    this._outputFrames = [];
    this._frameData = null;
    this.currentAnim = null;
    this.currentFrame = null;
    this.sprite = null;
    this.game = null;
  }
};

AnimationManager.prototype.constructor = AnimationManager;

Object.defineProperty(AnimationManager.prototype, 'frameData', {
  get: function() {
    return this._frameData;
  }
});

Object.defineProperty(AnimationManager.prototype, 'frameTotal', {
  get: function() {
    return this._frameData.total;
  }
});

Object.defineProperty(AnimationManager.prototype, 'paused', {
  get: function() {
    return this.currentAnim.isPaused;
  },

  set: function(value) {
    this.currentAnim.paused = value;
  }
});

Object.defineProperty(AnimationManager.prototype, 'name', {
  get: function() {
    if(this.currentAnim) {
      return this.currentAnim.name;
    }
  }
});

Object.defineProperty(AnimationManager.prototype, 'frame', {
  get: function() {
    if(this.currentFrame) {
      return this.currentFrame.index;
    }
  },

  set: function(value) {
    if(typeof value === 'number' && this._frameData && this._frameData.getFrame(value) !== null) {
      this.currentFrame = this._frameData.getFrame(value);
      if(this.currentFrame) {
        this.sprite.setFrame(this.currentFrame);
      }
    }
    if(typeof value === 'string'  && this._frameData && this._frameData.getFrame(value) !== null) {
      this.currentFrame = this._frameData.getFrameByName(value);
      if(this.currentFrame) {
        this.sprite.setFrame(this.currentFrame);
      }
    }
  }
});

Object.defineProperty(AnimationManager.prototype, 'frameName', {
  get: function() {
    if(this.currentFrame) {
        return this.currentFrame.name;
    }
  },

  set: function(value) {
    if(typeof value === 'string' && this._frameData && this._frameData.getFrameByName(value) !== null) {
      this.currentFrame = this._frameData.getFrameByName(value);

      if(this.currentFrame) {
        this._frameIndex = this.currentFrame.index;

        this.sprite.setFrame(this.currentFrame);
      }
    } else {
      console.warn('Cannot set frameName: ' + value);
    }
  }
});

module.exports = AnimationManager;
