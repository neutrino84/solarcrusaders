var Rectangle = require('../geometry/Rectangle'),
    Math = require('../utils/Math');

function Frame(index, x, y, width, height, name) {
  this.index = index;

  this.x = x;
  this.y = y;

  this.width = width;
  this.height = height;

  this.name = name;

  this.centerX = global.Math.floor(width / 2);
  this.centerY = global.Math.floor(height / 2);

  this.distance = Math.distance(0, 0, width, height);

  this.rotated = false;
  this.rotationDirection = 'cw';

  this.trimmed = false;

  this.sourceSizeW = width;
  this.sourceSizeH = height;

  this.spriteSourceSizeX = 0;
  this.spriteSourceSizeY = 0;
  this.spriteSourceSizeW = 0;
  this.spriteSourceSizeH = 0;

  this.right = this.x + this.width;
  this.bottom = this.y + this.height;
};

Frame.prototype = {

  resize: function(width, height) {
    this.width = width;
    this.height = height;
    this.centerX = global.Math.floor(width / 2);
    this.centerY = global.Math.floor(height / 2);
    this.distance = Math.distance(0, 0, width, height);
    this.sourceSizeW = width;
    this.sourceSizeH = height;
    this.right = this.x + width;
    this.bottom = this.y + height;
  },

  setTrim: function(trimmed, actualWidth, actualHeight, destX, destY, destWidth, destHeight) {
    this.trimmed = trimmed;

    if(trimmed) {
      this.sourceSizeW = actualWidth;
      this.sourceSizeH = actualHeight;
      this.centerX = global.Math.floor(actualWidth / 2);
      this.centerY = global.Math.floor(actualHeight / 2);
      this.spriteSourceSizeX = destX;
      this.spriteSourceSizeY = destY;
      this.spriteSourceSizeW = destWidth;
      this.spriteSourceSizeH = destHeight;
    }
  },

  clone: function() {
    var output = new Frame(this.index, this.x, this.y, this.width, this.height, this.name);
    for(var prop in this) {
      if(this.hasOwnProperty(prop)) {
        output[prop] = this[prop];
      }
    }
    return output;
  },

  getRect: function(out) {
    if(typeof out === 'undefined') {
      out = new Rectangle(this.x, this.y, this.width, this.height);
    } else {
      out.setTo(this.x, this.y, this.width, this.height);
    }
    return out;
  }

};

Frame.prototype.constructor = Frame;

module.exports = Frame;
