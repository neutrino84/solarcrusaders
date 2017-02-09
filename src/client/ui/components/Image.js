
var engine = require('engine'),
    Pane = require('./Pane'),
    Layout = require('../Layout'),
    ImageView = require('../views/ImageView'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function Image(game, settings) {
  Pane.call(this, game, Class.mixin(settings, {
    key: 'texture-atlas'
  }));

  this.image = new ImageView(game, this.settings.key, this.settings.frame);

  if(this.settings.width || this.settings.height) {
    this.image.width = this.settings.width;
    this.image.height = this.settings.height;
  }

  this.setPreferredSize(this.image.width, this.image.height);

  this.addView(this.image);
};

Image.prototype = Object.create(Pane.prototype);
Image.prototype.constructor = Image;

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
