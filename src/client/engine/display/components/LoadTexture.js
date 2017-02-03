var pixi = require('pixi'),
    Rectangle = require('../../geometry/Rectangle');

function LoadTexture() {};

LoadTexture.prototype = {
  
  loadTexture: function(key, frame, animations) {
    if(this.animations) { this.animations.stop(); }

    var cache = this.game.cache,
        frameData, frameRectangle;
    if(key instanceof pixi.RenderTexture || key instanceof pixi.Texture) {
      this.texture = key;
    } else {
      this.texture = new pixi.Texture(cache.getBaseTexture(key));
      this.frameData = cache.getFrameData(key);

      if(this.animations && animations != undefined) {
        this.animations.loadFrameData(frameData);
        
        // add animations
        for(var name in animations) {
          this.animations.add(
            name,
            animations[name].frames,
            animations[name].frameRate,
            animations[name].loop
          );
        }
      }

      if(frame != undefined) {
        this.setFrameByName(frame);
      }
    }
  },

  setFrameByName: function(name) {
    if(this.frameData == undefined) { return; }
    
    var frameData = this.frameData,
        frame = frameData.getFrameByName(name);

    this.setFrame(frame);
  },

  setFrame: function(frame) {
    var texture = this.texture;

    // update frame
    texture.frame.x = frame.x;
    texture.frame.y = frame.y;
    texture.frame.width = frame.width;
    texture.frame.height = frame.height;
    texture.orig.x = frame.x;
    texture.orig.y = frame.y;
    texture.orig.width = frame.width;
    texture.orig.height = frame.height;

    // update trim
    if(frame.trimmed) {
      if(texture.trim) {
        texture.trim.x = frame.spriteSourceSizeX;
        texture.trim.y = frame.spriteSourceSizeY;
        texture.trim.width = frame.sourceSizeW;
        texture.trim.height = frame.sourceSizeH;
      } else {
        texture.trim = {
          x: frame.spriteSourceSizeX,
          y: frame.spriteSourceSizeY,
          width: frame.sourceSizeW,
          height: frame.sourceSizeH
        };
      }
    } else if(!frame.trimmed && texture.trim) {
      texture.trim = null;
    }

    texture._updateUvs();
  }
};

module.exports = LoadTexture;

