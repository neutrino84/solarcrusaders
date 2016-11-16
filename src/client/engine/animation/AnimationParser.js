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
    if(!json['frames']) {
      console.warn("AnimationParser.JSONData: Invalid Texture Atlas JSON given, missing 'frames' array");
      console.log(json);
      return;
    }

    //  Let's create some frames then
    var data = new FrameData();

    //  By this stage frames is a fully parsed array
    var frames = json['frames'];
    var newFrame;

    for(var i = 0; i < frames.length; i++) {
      newFrame = data.addFrame(new Frame(
        i,
        frames[i].frame.x,
        frames[i].frame.y,
        frames[i].frame.w,
        frames[i].frame.h,
        frames[i].filename
      ));

      if(frames[i].trimmed) {
        newFrame.setTrim(
          frames[i].trimmed,
          frames[i].sourceSize.w,
          frames[i].sourceSize.h,
          frames[i].spriteSourceSize.x,
          frames[i].spriteSourceSize.y,
          frames[i].spriteSourceSize.w,
          frames[i].spriteSourceSize.h
        );
      }
    }

    return data;
  },

  JSONDataHash: function(game, json) {
    //  Malformed?
    if(!json['frames']) {
      console.warn("AnimationParser.JSONDataHash: Invalid Texture Atlas JSON given, missing 'frames' object");
      console.log(json);
      return;
    }

    //  Let's create some frames then
    var data = new FrameData();

    //  By this stage frames is a fully parsed array
    var frames = json['frames'];
    var newFrame;
    var i = 0;
    for(var key in frames) {
      newFrame = data.addFrame(new Frame(
        i,
        frames[key].frame.x,
        frames[key].frame.y,
        frames[key].frame.w,
        frames[key].frame.h,
        key
      ));

      if(frames[key].trimmed) {
        newFrame.setTrim(
          frames[key].trimmed,
          frames[key].sourceSize.w,
          frames[key].sourceSize.h,
          frames[key].spriteSourceSize.x,
          frames[key].spriteSourceSize.y,
          frames[key].spriteSourceSize.w,
          frames[key].spriteSourceSize.h
        );
      }

      i++;
    }

    return data;
  }
};

module.exports = AnimationParser;
