var pixi = require('pixi'),
    Const = require('../const'),
    Sprite = require('../display/Sprite'),
    Frame = require('../animation/Frame'),
    FrameData = require('../animation/FrameData');

function Font(game, key, options) {
  this.game = game;
  this.type = Const.FONT;

  this._text = '';
  this._multiline = options.multiline || false;
  this._autouppercase = options.autouppercase || false;
  this._charset = options.charset || Font.CHAR_SET;
  this._character =
    options.character || {
      width: 10,
      height: 10,
      size: 0,
      spacing: {
        x: 0,
        y: 0
      },
      offset: {
        x: 0,
        y: 0
      }
    };

  this.frameKeys = [];
  this.frames = new FrameData();
  this.texture = new pixi.RenderTexture.create(32, 32, pixi.SCALE_MODES.NEAREST);
  this.typer = new Sprite(game, key);

  this.platen = new pixi.Container();
  this.platen.addChild(this.typer);

  this.generateFrameData(this._charset);
};

Font.prototype.constructor = Font;

Font.CHAR_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.%+/*';
Font.CHAR_SET_FULL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!"#$%&\'()*+.,-/@';

Font.prototype.generateFrameData = function(charset) {
  var frame, size = 0,
      character = this._character,
      spacing = character.spacing,
      offset = character.offset,
      x = offset.x,
      y = offset.y;
  for(var c=0; c<charset.length; c++) {
    frame = this.frames.addFrame(new Frame(c, x, y, character.width, character.height));
    this.frameKeys[charset.charCodeAt(c)] = frame.index;
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
  var cx = 0,
      cy = 0,
      lines = this._text.split('\n'),
      character = this._character,
      spacing = character.spacing,
      offset = character.offset,
      len = lines.length;

  this.texture.resize(this.getLongestLine() * character.width, len * character.height + ((len * spacing.y) - spacing.y));

  for(var i=0; i<len; i++) {
    cx = 0;
    this.render(lines[i], cx, cy);
    cy += character.height + spacing.y;
  }
};

Font.prototype.render = function(line, x, y) {
  var character = this._character;
  for(var c=0; c<line.length; c++) {
    if(line.charAt(c) === ' ') {
      x += character.width;
    } else {
      if(this.frameKeys[line.charCodeAt(c)] >= 0) {
        this.typer.x = x;
        this.typer.y = y;

        this.typer.setFrame(this.frames.getFrame(this.frameKeys[line.charCodeAt(c)]));
        
        this.game.renderer.render(this.platen, this.texture, x == 0 && y == 0 ? true : false);

        x += character.width;

        if(x > this.width) {
          break;
        }
      }
    }
  }
};

Font.prototype.getLongestLine = function() {
  var lines,
      longest = 0;
  if(this._text.length > 0) {
    lines = this._text.split('\n');
    for(var i=0; i<lines.length; i++) {
      if(lines[i].length > longest) {
        longest = lines[i].length;
      }
    }
  }
  return longest;
};

Font.prototype.removeUnsupportedCharacters = function() {
  var achar, code,
      sanitize = '';
  for(var c=0; c<this._text.length; c++) {
    achar = this._text[c];
    code = achar.charCodeAt(0);
    
    if(this.frameKeys[code] >= 0 || (!this._multiline && achar === '\n')) {
      sanitize = sanitize.concat(achar);
    }
  }
  return sanitize;
};

Object.defineProperty(Font.prototype, 'text', {
  get: function() {
    return this._text;
  },

  set: function(value) {
    if(this._autouppercase) {
      value = value.toUpperCase();
    } else {
      value = value;
    }
    if(value !== this._text) {
      this._text = value;
      this.removeUnsupportedCharacters();
      this.update();
    }
  }
});

module.exports = Font;
