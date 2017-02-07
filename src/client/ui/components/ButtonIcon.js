
var pixi = require('pixi'),
    engine = require('engine'),
    Button = require('./Button'),
    Layout = require('../Layout'),
    StackLayout = require('../layouts/StackLayout'),
    ImageView = require('../views/ImageView'),
    ColorBlend = require('../helpers/ColorBlend'),
    Class = engine.Class;

function ButtonIcon(game, settings) {
  Button.call(this, game, Class.mixin(settings, {
    label: false
  }));

  this.image = new ImageView(game, settings.icon.key, settings.icon.frame);
  this.image.tint = 0x999999;

  if(settings.width && settings.height) {
    this.image.width = settings.width;
    this.image.height = settings.height;
  }

  // color blend
  this.imageColorBlend = new ColorBlend(game, this.image);
  this.imageColorBlend.setColor(0x336699, 0x33cc33, 250, engine.Easing.Quadratic.InOut, true);

  this.bg.on('inputOver', this._inputOver, this);
  this.bg.on('inputOut', this._inputOut, this);
  this.bg.on('inputDown', this._inputDown, this);
  this.bg.on('inputUp', this._inputUp, this);

  // add to display
  this.addView(this.image);
};

ButtonIcon.prototype = Object.create(Button.prototype);
ButtonIcon.prototype.constructor = ButtonIcon;

ButtonIcon.prototype.alert = function(value) {
  Button.prototype.alert.call(this, value);
};

ButtonIcon.prototype.tint = function(value) {
  Button.prototype.tint.call(this, value);
};

ButtonIcon.prototype.disabled = function(value) {
  Button.prototype.disabled.call(this, value);
  if(this._disabled) {
    this.image.tint = 0xffffff;
  } else {
    this.image.tint = 0x999999;
  }
};

ButtonIcon.prototype._inputUp = function() {
  this.image.blendMode = pixi.BLEND_MODES.NORMAL;
};

ButtonIcon.prototype._inputDown = function() {
  this.image.blendMode = pixi.BLEND_MODES.ADD;
};

ButtonIcon.prototype._inputOver = function() {
  this.image.tint = 0xffffff;
};

ButtonIcon.prototype._inputOut = function() {
  this.image.tint = 0x999999;
};

ButtonIcon.prototype.getPreferredSize = function() {
  return {
    width: this.image.width + this.margin.left + this.margin.right,
    height: this.image.height + this.margin.bottom + this.margin.top
  };
};

ButtonIcon.prototype.paint = function() {
  this.image.position.set(this.margin.top, this.margin.left);
  for(var i=0; i<this.views.length; i++) {
    this.views[i].paint();
  }
};

module.exports = ButtonIcon;
