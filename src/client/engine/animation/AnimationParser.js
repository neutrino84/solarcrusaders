var Frame = require('./Frame'),
    FrameData = require('./FrameData');

var AnimationParser = {
  spriteSheet: function(game, key, frameWidth, frameHeight, frameMax, margin, spacing) {
    var img = key;

    if(typeof key === 'string') {
      img = game.cache.getImage(key);
    }

    if(img === null) { return null; }

    var width = img.width;
    var height = img.height;

    if(frameWidth <= 0) {
      frameWidth = Math.floor(-width / Math.min(-1, frameWidth));
    }

    if(frameHeight <= 0) {
      frameHeight = Math.floor(-height / Math.min(-1, frameHeight));
    }

    var row = Math.floor((width - margin) / (frameWidth + spacing));
    var column = Math.floor((height - margin) / (frameHeight + spacing));
    var total = row * column;

    if(frameMax !== -1) {
      total = frameMax;
    }

    //  Zero or smaller than frame sizes?
    if(width === 0 || height === 0 || width < frameWidth || height < frameHeight || total === 0) {
      console.warn("AnimationParser.spriteSheet: '" + key + "'s width/height zero or width/height < given frameWidth/frameHeight");
      return null;
    }

    //  Let's create some frames then
    var data = new FrameData();
    var x = margin;
    var y = margin;

    for(var i = 0; i < total; i++) {
      data.addFrame(new Frame(i, x, y, frameWidth, frameHeight, ''));

      x += frameWidth + spacing;

      if(x + frameWidth > width) {
        x = margin;
        y += frameHeight + spacing;
      }
    }

    return data;
  },

  JSONData: function(game, json) {
    //  Malformed?
    if(!json.frames) {
      console.warn("AnimationParser.JSONData: Invalid Texture Atlas JSON given, missing 'frames' array");
      console.log(json);
      return;
    }

    //  Let's create some frames then
    var frames = json.frames,
        frameData = new FrameData(),
        frame, atlas;

    for(var i=0; i<frames.length; i++) {
      atlas = frames[i];
      
      // create and add frame
      frame = frameData.addFrame(
        new Frame(i,
          atlas.frame.x,
          atlas.frame.y,
          atlas.frame.w,
          atlas.frame.h,
          atlas.filename
        )
      );

      // trim if necessary
      if(atlas.trimmed) {
        frame.setTrim(
          atlas.trimmed,
          atlas.sourceSize.w,
          atlas.sourceSize.h,
          atlas.spriteSourceSize.x,
          atlas.spriteSourceSize.y,
          atlas.spriteSourceSize.w,
          atlas.spriteSourceSize.h
        );
      }
    }

    return data;
  },

  JSONDataHash: function(game, json) {
    //  Malformed?
    if(!json.frames) {
      console.warn("AnimationParser.JSONDataHash: Invalid Texture Atlas JSON given, missing 'frames' object");
      console.log(json);
      return;
    }

    var frames = json.frames,
        frameData = new FrameData(),
        frame, atlas,
        i = 0;

    for(var key in frames) {
      atlas = frames[key];
      frame = frameData.addFrame(
        new Frame(
          i,
          atlas.frame.x,
          atlas.frame.y,
          atlas.frame.w,
          atlas.frame.h,
          key
        )
      );

      if(atlas.trimmed) {
        frame.setTrim(
          atlas.trimmed,
          atlas.sourceSize.w,
          atlas.sourceSize.h,
          atlas.spriteSourceSize.x,
          atlas.spriteSourceSize.y,
          atlas.spriteSourceSize.w,
          atlas.spriteSourceSize.h
        );
      }

      i++;
    }

    return frameData;
  }
};

module.exports = AnimationParser;
