var pixi = require('pixi'),
    Sprite = require('../display/Sprite'),
    Frame = require('../animation/Frame'),
    FrameData = require('../animation/FrameData');

function Font(game, settings) {
  this.game = game;
  this.config = Font.FONT_CONFIG[settings.name];
  this.settings = settings;
  this.value = '';

  // store data
  this.keys = [];
  this.texture = new pixi.RenderTexture.create(32, 32, pixi.SCALE_MODES.NEAREST); // LINEAR
  this.frames = new FrameData();
  this.typer = new Sprite(game, settings.name);

  // moving container
  this.platen = new pixi.Container();
  this.platen.addChild(this.typer);

  // generate frame data
  this.generateFrameData();
};

Font.CHAR_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.%+/*';
Font.CHAR_SET_FULL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!"#$%&\'()*+.,-/@';
Font.FONT_CONFIG = {
  full: {
    charset: Font.CHAR_SET_FULL,
    autouppercase: false,
    character: {
      width: 6,
      height: 8,
      size: 0,
      spacing: { x: 0, y: 2 },
      offset: { x: 0, y: 0 }
    }
  },
  medium: {
    autouppercase: true,
    character: {
      width: 8,
      height: 7,
      size: 0,
      spacing: { x: 0, y: 2 },
      offset: { x: 0, y: 0 }
    }
  },
  small: {
    autouppercase: true,
    character: {
      width: 5,
      height: 5,
      size: 0,
      spacing: { x: 0, y: 2 },
      offset: { x: 0, y: 0 }
    }
  }
};

Font.prototype.constructor = Font;

Font.prototype.generateFrameData = function() {
  var config = this.config,
      keys = this.keys,
      frames = this.frames,
      charset = config.charset || Font.CHAR_SET,
      character = config.character,
      spacing = character.spacing,
      offset = character.offset,
      x = offset.x,
      y = offset.y,
      frame, size = 0;

  // generate
  for(var c=0; c<charset.length; c++) {
    // create and add frame
    frame = new Frame(c, x, y, character.width, character.height);
    frames.addFrame(frame);

    // add frame index to keys
    keys[charset.charCodeAt(c)] = frame.index;

    // increment
    size++;
    if(size === character.size) {
      size = 0;
      x = offset.x;
      y += character.height + spacing.y;
    } else {
      x += character.width + spacing.x;
    }
  }
};

Font.prototype.update = function() {
  var lines = this.value.split('\n'),
      character = this.config.character,
      texture = this.texture,
      typer = this.typer,
      platen = this.platen,
      keys = this.keys,
      frames = this.frames,
      renderer = this.game.renderer,
      longest = this.getLongestLine(),
      spacing = character.spacing,
      offset = character.offset,
      len = lines.length,
      cx = 0, cy = 0;

  // resize render texture
  texture.resize(longest * character.width, len * character.height + ((len * spacing.y) - spacing.y));

  // render update
  for(var i=0; i<len; i++) {
    cx = 0;
    for(var c=0; c<lines[i].length; c++) {
      if(lines[i].charAt(c) === ' ') {
        cx += character.width;
      } else {
        if(keys[lines[i].charCodeAt(c)] >= 0) {
          // repostion
          typer.x = cx;
          typer.y = cy;
          typer.setFrame(frames.getFrame(keys[lines[i].charCodeAt(c)]));

          // render to texture
          renderer.render(platen, texture, cx == 0 && cy == 0 ? true : false);

          // add offset
          cx += character.width;
        }
      }
    }
    cy += character.height + spacing.y;
  }
};

Font.prototype.getLongestLine = function() {
  var lines,
      longest = 0,
      value = this.value;
  if(value.length > 0) {
    lines = value.split('\n');
    for(var i=0; i<lines.length; i++) {
      if(lines[i].length > longest) {
        longest = lines[i].length;
      }
    }
  }
  return longest;
};

Object.defineProperty(Font.prototype, 'text', {
  get: function() {
    return this.value;
  },

  set: function(value) {
    // autouppercase
    value = this.config.autouppercase ? value.toUpperCase() : value;

    // update
    if(value !== this.value) {
      this.value = value;
      // this.removeUnsupportedCharacters();
      this.update();
    }
  }
});

module.exports = Font;

