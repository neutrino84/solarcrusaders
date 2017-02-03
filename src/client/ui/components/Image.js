
var engine = require('engine'),
    Panel = require('../Panel'),
    ImageView = require('../views/ImageView'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function Image(game, key, settings) {
  Panel.call(this, game, this, settings.constraint);

  this.settings = Class.mixin(settings, {
    padding: [0],
    margin: [0]
  });

  this.setPadding.apply(this, this.settings.padding);
  this.setMargin.apply(this, this.settings.margin);

  this.image = new ImageView(game, key, settings.frame);

  if(settings.width || settings.height) {
    this.image.width = settings.width;
    this.image.height = settings.height;
  }
  
  if(settings.bg) {
    this.bg = new BackgroundView(game, settings.bg);
    this.addView(this.bg);
  }

  this.addView(this.image);
};

Image.prototype = Object.create(Panel.prototype);
Image.prototype.constructor = Image;

Image.prototype.calcPreferredSize = function(target) {
  return {
    width: this.image.width,
    height: this.image.height
  };
};

Image.prototype.doLayout = function() {
  this.image.position.set(this.left, this.top);
};

Object.defineProperty(Image.prototype, 'blendMode', {
  set: function(value) {
    this.image.blendMode = value;
  },

  get: function() {
    return this.image.blendMode;
  }
});

Object.defineProperty(Image.prototype, 'tint', {
  set: function(value) {
    this.image.tint = value;
  },

  get: function() {
    return this.image.tint;
  }
});

module.exports = Image;
