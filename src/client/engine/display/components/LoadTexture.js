var pixi = require('pixi'),
    Rectangle = require('../../geometry/Rectangle');

function LoadTexture() {};

LoadTexture.prototype = {
  customRender: false,

  _frame: null,

  loadTexture: function(key, frame, stopAnimation) {
    if((stopAnimation || typeof stopAnimation === 'undefined') && this.animations) {
      this.animations.stop();
    }

    this.key = key;
    this.customRender = false;
    
    var setFrame = true,
        smoothed = !this.texture.baseTexture.scaleMode;
    if(key instanceof pixi.RenderTexture || key instanceof pixi.Texture) {
      this.texture = key;
    } else {
      img = this.game.cache.getImage(key, true);

      this.key = img.key;
      this.texture = new pixi.Texture(img.base);

      if(this.animations) {
        setFrame = !this.animations.loadFrameData(img.frameData, frame || 0);
      }
    }
    
    if(setFrame) {
      this._frame = Rectangle.clone(this.texture.frame);
    }

    if(!smoothed) {
      this.texture.baseTexture.scaleMode = 1;
    }

    if(img.base.isPowerOfTwo) {
      img.base.mipmap = true;
    }
  },

  setFrame: function(frame) {
    this._frame = frame;

    this.texture.frame.x = frame.x;
    this.texture.frame.y = frame.y;
    this.texture.frame.width = frame.width;
    this.texture.frame.height = frame.height;

    this.texture.crop.x = frame.x;
    this.texture.crop.y = frame.y;
    this.texture.crop.width = frame.width;
    this.texture.crop.height = frame.height;

    if(frame.trimmed) {
      if(this.texture.trim) {
        this.texture.trim.x = frame.spriteSourceSizeX;
        this.texture.trim.y = frame.spriteSourceSizeY;
        this.texture.trim.width = frame.sourceSizeW;
        this.texture.trim.height = frame.sourceSizeH;
      } else {
        this.texture.trim = {
          x: frame.spriteSourceSizeX, y: frame.spriteSourceSizeY,
          width: frame.sourceSizeW, height: frame.sourceSizeH
        };
      }

      this.texture.width = frame.sourceSizeW;
      this.texture.height = frame.sourceSizeH;
      this.texture.frame.width = frame.sourceSizeW;
      this.texture.frame.height = frame.sourceSizeH;
    } else if(!frame.trimmed && this.texture.trim) {
      this.texture.trim = null;
    }

    if(this.cropRect) {
      this.updateCrop();
    }

    this.texture.requiresReTint = true;
    this.texture._updateUvs();

    if(this.tilingTexture) {
      this.refreshTexture = true;
    }
  },

  resizeFrame: function(parent, width, height) {
    this.texture.frame.resize(width, height);
    this.texture.setFrame(this.texture.frame);
  },

  resetFrame: function() {
    if(this._frame) {
      this.setFrame(this._frame);
    }
  },

  frame: {
    get: function() {
      return this.animations.frame;
    },

    set: function(value) {
      this.animations.frame = value;
    }
  }
};

module.exports = LoadTexture;

