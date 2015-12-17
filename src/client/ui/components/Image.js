
var engine = require('engine'),
    Panel = require('../Panel'),
    ImageView = require('../views/ImageView'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function Image(game, key, settings) {
  Panel.call(this, game, this);

  this.settings = Class.mixin(settings, {
    padding: [2, 2],
    border: [1],
    bg: {
      fillAlpha: 0.75,
      color: 0x3868b8,
      borderSize: 0.0
    }
  });

  this.setPadding.apply(this, this.settings.padding);
  this.setBorder.apply(this, this.settings.border);

  this.bg = new BackgroundView(game, this.settings.bg);
  this.image = new ImageView(game, key, this.settings.frame);

  if(this.settings.width || this.settings.height) {
    this.setPreferredSize(this.settings.width, this.settings.height);
    this.image.width = this.settings.width;
    this.image.height = this.settings.height;
  }

  this.addView(this.bg);
  this.addView(this.image);
};

Image.prototype = Object.create(Panel.prototype);
Image.prototype.constructor = Image;

Image.prototype.calcPreferredSize = function(target) {
  return { width: this.image.width, height: this.image.height };
};

Image.prototype.doLayout = function() {
  this.image.position.set(this.left, this.top);
};

Object.defineProperty(Image.prototype, 'tint', {
  set: function(value) {
    this.image.tint = value;
  },

  get: function() {
    return this.image.tint;
  }
});

module.exports = Image;
