
var engine = require('engine'),
    Pane = require('./Pane'),
    Layout = require('../Layout'),
    ImageView = require('../views/ImageView'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function Image(game, settings) {
  Pane.call(this, game, Class.mixin(settings, {
    constraint: Layout.USE_PS_SIZE,
    key: 'texture-atlas',
    layout: {
      type: 'none'
    }
  }));

  this.view = new ImageView(game, this.settings.key, this.settings.frame);

  if(this.settings.width || this.settings.height) {
    this.view.width = this.settings.width;
    this.view.height = this.settings.height;
  }

  if(this.settings.blendMode) {
    this.view.blendMode = this.settings.blendMode;
  }

  this.setPreferredSize(this.view.width, this.view.height);

  this.addView(this.view);
};

Image.prototype = Object.create(Pane.prototype);
Image.prototype.constructor = Image;

Image.prototype.doLayout = function() {
  // position
  this.view.position.set(
    this.margin.left + this.padding.left,
    this.margin.top + this.padding.top);
};

// Object.defineProperty(Image.prototype, 'blendMode', {
//   set: function(value) {
//     this.view.blendMode = value;
//   },

//   get: function() {
//     return this.view.blendMode;
//   }
// });

// Object.defineProperty(Image.prototype, 'tint', {
//   set: function(value) {
//     this.view.tint = value;
//   },

//   get: function() {
//     return this.view.tint;
//   }
// });

module.exports = Image;
