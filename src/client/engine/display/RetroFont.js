
var pixi = require('pixi'),
    Const = require('../const'),
    Sprite = require('../display/Sprite'),
    Frame = require('../animation/Frame'),
    FrameData = require('../animation/FrameData');

function RetroFont(game, key, options) {
  if(!game.cache.checkImageKey(key)) {
    console.warn("RetroFont - Can't find font:" + key);
    return false;
  }
  if(options === undefined) { options = {}; }
  if(options.chars === undefined) { options.chars = RetroFont.TEXT_SET; }

  this.type = Const.RETROFONT;
  this.align = 'left';
  this.currentText = '';

  this.grabData = [];

  this.image = game.cache.getImage(key, true);

  this.characterWidth = options.characterWidth || this.image.data.width / options.chars.length;
  this.characterHeight = options.characterHeight || this.image.data.height;

  this.characterSpacingX = options.xSpacing || 0;
  this.characterSpacingY = options.ySpacing || 0;

  this.characterPerRow = options.charsPerRow || this.image.data.width / this.characterWidth;

  this.offsetX = options.xOffset || 0;
  this.offsetY = options.yOffset || 0;

  this.multiLine = false;
  this.autoUpperCase = true;
  this.fixedWidth = 0;

  this.customSpacingX = 0;
  this.customSpacingY = 0;

  this.frameData = new FrameData();
  this.stamp = new Sprite(game, key);

  this.generateFrameData(options.chars);

  pixi.RenderTexture.call(this, game.renderer, 100, 100, pixi.SCALE_MODES.NEAREST);
};

RetroFont.prototype = Object.create(pixi.RenderTexture.prototype);
RetroFont.prototype.constructor = RetroFont;

RetroFont.ALIGN_LEFT = 'left';
RetroFont.ALIGN_RIGHT = 'right';
RetroFont.ALIGN_CENTER = 'center';

RetroFont.TEXT_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.';

RetroFont.prototype.setFixedWidth = function(width, lineAlignment) {
  if(lineAlignment === undefined) { lineAlignment = 'left'; }

  this.fixedWidth = width;
  this.align = lineAlignment;
};

RetroFont.prototype.setText = function(content, multiLine, characterSpacing, lineSpacing, lineAlignment, allowLowerCase) {
  this.multiLine = multiLine || false;
  this.customSpacingX = characterSpacing || 0;
  this.customSpacingY = lineSpacing || 0;
  this.align = lineAlignment || 'left';

  if(allowLowerCase) {
    this.autoUpperCase = false;
  } else {
    this.autoUpperCase = true;
  }

  if(content.length > 0) {
    this.text = content;
  }
};

RetroFont.prototype.buildRetroFontText = function() {
  var cx = 0;
  var cy = 0;

  // Clears the textureBuffer
  this.clear();

  if(this.multiLine) {
    var lines = this.currentText.split("\n");

    if(this.fixedWidth > 0) {
      this.resize(this.fixedWidth, (lines.length * (this.characterHeight + this.customSpacingY)) - this.customSpacingY, true);
    } else {
      this.resize(this.getLongestLine() * (this.characterWidth + this.customSpacingX), (lines.length * (this.characterHeight + this.customSpacingY)) - this.customSpacingY, true);
    }

    // Loop through each line of text
    for(var i = 0; i < lines.length; i++) {
      // RetroFont.ALIGN_LEFT
      cx = 0;

      // This line of text is held in lines[i] - need to work out the alignment
      if(this.align === RetroFont.ALIGN_RIGHT) {
        cx = this.width - (lines[i].length * (this.characterWidth + this.customSpacingX));
      } else if(this.align === RetroFont.ALIGN_CENTER) {
        cx = (this.width / 2) - ((lines[i].length * (this.characterWidth + this.customSpacingX)) / 2);
        cx += this.customSpacingX / 2;
      }

      // Sanity checks
      if(cx < 0) {
        cx = 0;
      }

      this.pasteLine(lines[i], cx, cy, this.customSpacingX);

      cy += this.characterHeight + this.customSpacingY;
    }
  } else {
      if(this.fixedWidth > 0) {
        this.resize(this.fixedWidth, this.characterHeight, true);
      } else {
        this.resize(this.currentText.length * (this.characterWidth + this.customSpacingX), this.characterHeight, true);
      }

      // RetroFont.ALIGN_LEFT
      cx = 0;
      if(this.align === RetroFont.ALIGN_RIGHT) {
        cx = this.width - (this.currentText.length * (this.characterWidth + this.customSpacingX));
      } else if(this.align === RetroFont.ALIGN_CENTER) {
        cx = (this.width / 2) - ((this.currentText.length * (this.characterWidth + this.customSpacingX)) / 2);
        cx += this.customSpacingX / 2;
      }

      // Sanity checks
      if(cx < 0) {
        cx = 0;
      }

      this.pasteLine(this.currentText, cx, 0, this.customSpacingX);
  }

  this.requiresReTint = true;
};

RetroFont.prototype.pasteLine = function(line, x, y, customSpacingX) {
  var matrix = new pixi.Matrix();
  for(var c = 0; c < line.length; c++) {
    // If it's a space then there is no point copying, so leave a blank space
    if(line.charAt(c) === ' ') {
      x += this.characterWidth + customSpacingX;
    } else {
      // If the character doesn't exist in the font then we don't want a blank space, we just want to skip it
      if(this.grabData[line.charCodeAt(c)] >= 0) {
        matrix.tx = x;
        matrix.ty = y;

        this.stamp.setFrame(this.frameData.getFrame(this.grabData[line.charCodeAt(c)]));

        this.render(this.stamp, matrix, false, false);

        x += this.characterWidth + customSpacingX;

        if(x > this.width) {
          break;
        }
      }
    }
  }
};

RetroFont.prototype.getLongestLine = function() {
  var longestLine = 0;
  if(this.currentText.length > 0) {
    var lines = this.currentText.split("\n");
    for(var i = 0; i < lines.length; i++) {
      if(lines[i].length > longestLine) {
        longestLine = lines[i].length;
      }
    }
  }
  return longestLine;
};

RetroFont.prototype.removeUnsupportedCharacters = function(stripCR) {
  var newString = '';
  for(var c = 0; c < this.currentText.length; c++) {
    var aChar = this.currentText[c];
    var code = aChar.charCodeAt(0);
    if(this.grabData[code] >= 0 || (!stripCR && aChar === "\n")) {
      newString = newString.concat(aChar);
    }
  }
  return newString;
};

RetroFont.prototype.generateFrameData = function(chars) {
  var frame, row = 0,
      currentX = this.offsetX,
      currentY = this.offsetY;
  for(var c=0; c<chars.length; c++) {
    frame = this.frameData.addFrame(new Frame(c, currentX, currentY, this.characterWidth, this.characterHeight));
    this.grabData[chars.charCodeAt(c)] = frame.index;
    row++;
    if(row === this.characterPerRow) {
      row = 0;
      currentX = this.offsetX;
      currentY += this.characterHeight + this.characterSpacingY;
    } else {
      currentX += this.characterWidth + this.characterSpacingX;
    }
  }
};

Object.defineProperty(RetroFont.prototype, 'text', {
  get: function() {
    return this.currentText;
  },

  set: function(value) {
    var newText;
    if(this.autoUpperCase) {
      newText = value.toUpperCase();
    } else {
      newText = value;
    }

    if(newText !== this.currentText) {
      this.currentText = newText;
      this.removeUnsupportedCharacters(this.multiLine);
      this.buildRetroFontText();
    }
  }
});

Object.defineProperty(RetroFont.prototype, 'smoothed', {
  get: function() {
    return this.stamp.smoothed;
  },

  set: function(value) {
    this.stamp.smoothed = value;
    this.buildRetroFontText();
  }
});

module.exports = RetroFont;
