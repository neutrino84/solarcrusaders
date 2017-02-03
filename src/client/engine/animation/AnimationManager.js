var Animation = require('./Animation');

function AnimationManager(sprite) {
  this.sprite = sprite;
  this.game = sprite.game;

  this.frame = 0;
  this.currentAnim = null;
  this.isLoaded = false;

  this._frameData = null;
  this._anims = {};
};

AnimationManager.prototype = {
  loadFrameData: function(frameData, frame) {
    if(frameData === undefined) { return; }
    
    this._frameData = frameData;

    if(this.isLoaded) {
      for(var anim in this._anims) {
        this._anims[anim].updateFrameData(frameData);
      }
    }

    this.isLoaded = true;
  },

  copyFrameData: function(frameData, frame) {
    if(frameData === undefined) { return; }

    this._frameData = frameData.clone();

    if(this.isLoaded) {
      for(var anim in this._anims) {
        this._anims[anim].updateFrameData(this._frameData);
      }
    }
    
    this.isLoaded = true;
  },

  add: function(name, frames, frameRate, loop, useNumericIndex) {
    if(frames === undefined) { frames = []; }
    if(frameRate === undefined) { frameRate = 60; }
    if(loop === undefined) { loop = false; }

    //  If they didn't set the useNumericIndex then let's at least try and guess it
    if(useNumericIndex === undefined) {
      if(frames && typeof frames[0] === 'number') {
        useNumericIndex = true;
      } else {
        useNumericIndex = false;
      }
    }

    var game = this.game,
        sprite = this.sprite,
        frameData = this._frameData,
        outputFrames = [];

    this._frameData.getFrameIndexes(frames, useNumericIndex, outputFrames);
    this._anims[name] = new Animation(game, name, sprite, frameData, outputFrames, frameRate, loop);

    // return new animation
    return this._anims[name];
  },

  play: function(name, frameRate, loop) {
    if(this._anims[name]) {
      if(this.currentAnim === this._anims[name]) {
        if(this.currentAnim.isPlaying === false) {
          this.currentAnim.play(frameRate, loop);
        }
      } else {
        if(this.currentAnim && this.currentAnim.isPlaying) {
          this.currentAnim.stop();
        }
        this.currentAnim = this._anims[name];
        this.currentAnim.play(frameRate, loop);
      }
    }
  },

  stop: function(resetFrame, dispatchComplete) {
    if(this.currentAnim) {
      this.currentAnim.stop(resetFrame, dispatchComplete);
    }
  },

  update: function() {
    if(!this.sprite.visible) { return false; }
    if(this.currentAnim) {
      this.currentAnim.update();
    }
  },

  next: function(quantity) {
    if(this.currentAnim) {
      this.currentAnim.next(quantity);
    }
  },

  previous: function(quantity) {
    if(this.currentAnim) {
      this.currentAnim.previous(quantity);
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

  destroy: function() {
    var anim = null;

    for(var anim in this._anims) {
        if(this._anims.hasOwnProperty(anim)) {
            this._anims[anim].destroy();
        }
    }

    this._anims = {};
    this._frameData = null;
    this.currentAnim = null;
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

Object.defineProperty(AnimationManager.prototype, 'total', {
  get: function() {
    return this._frameData.total;
  }
});

Object.defineProperty(AnimationManager.prototype, 'name', {
  get: function() {
    if(this.currentAnim) {
      return this.currentAnim.name;
    }
  }
});

module.exports = AnimationManager;
