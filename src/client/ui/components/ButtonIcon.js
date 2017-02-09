
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
    label: false,
    icon: {
      key: 'texture-atlas',
      tint: {
        enabled: 0x999999,
        disabled: 0x993333,
        over: 0xFFFFFF,
        out: 0x999999,
        down: 0xFF0000,
        up: 0xFFFFFF
      }
    },
  }));

  this.image = new ImageView(game, this.settings.icon.key, this.settings.icon.frame);
  this.image.tint = this.settings.icon.tint.enabled;

  if(this.settings.width && this.settings.height) {
    this.image.width = this.settings.width;
    this.image.height = this.settings.height;
  }

  // alert color blend
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

ButtonIcon.prototype.disabled = function(value) {
  Button.prototype.disabled.call(this, value);
  if(this._disabled) {
    this.image.tint = this.settings.icon.tint.disabled;
  } else {
    this.image.tint = this.settings.icon.tint.enabled;
  }
};

ButtonIcon.prototype._inputUp = function() {
  this.image.blendMode = pixi.BLEND_MODES.NORMAL;
  this.image.tint = this.settings.icon.tint.up;
};

ButtonIcon.prototype._inputDown = function() {
  this.image.blendMode = pixi.BLEND_MODES.ADD;
  this.image.tint = this.settings.icon.tint.down;
};

ButtonIcon.prototype._inputOver = function() {
  this.image.tint = this.settings.icon.tint.over;
};

ButtonIcon.prototype._inputOut = function() {
  this.image.tint = this.settings.icon.tint.out;
};

ButtonIcon.prototype.getPreferredSize = function() {
  return {
    width: this.image.width + this.left + this.right,
    height: this.image.height + this.top + this.bottom
  };
};

module.exports = ButtonIcon;
