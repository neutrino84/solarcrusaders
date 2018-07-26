
var pixi = require('pixi'),
    engine = require('engine'),
    Button = require('./Button'),
    Layout = require('../Layout'),
    Image = require('./Image'),
    BackgroundView = require('../views/BackgroundView'),
    ColorBlend = require('../helpers/ColorBlend'),
    Class = engine.Class;

function ButtonIcon(game, settings) {
  Button.call(this, game, Class.mixin(settings, {
    label: false,
    icon: {
      key: 'texture-atlas',
      bg: {
        fillAlpha: 1.0,
        color: 0x000000
      },
      alpha: {
        enabled: 1.0,
        disabled: 1.0,
        over: 1.0,
        down: 1.0,
        up: 1.0
      },
      tint: {
        enabled: 0xFFFFFF,
        disabled: 0xFFFFFF,
        over: 0xFFFFFF,
        down: 0xFFFFFF,
        up: 0xFFFFFF
      }
    },
    highlight: {
      color: 0xFFFFFF,
      blendMode: pixi.BLEND_MODES.ADD,
      alpha: {
        enabled: 0.0,
        disabled: 0.0,
        over: 0.1,
        down: 0.1,
        up: 0.0
      }
    }
  }));

  // alert color blend
  // this.imageColorBlend = new ColorBlend(game, this.image);
  // this.imageColorBlend.setColor(0x336699, 0x33cc33, 250, engine.Easing.Quadratic.InOut, true);

  // add to display
  this.image = new Image(game, this.settings.icon);
  this.addPanel(this.image);

  if(this.settings.highlight) {
    this.highlight = new BackgroundView(this.game, this.settings.highlight);
    this.highlight.alpha = this._disabled ? 
      this.settings.highlight.alpha.disabled :
      this.settings.highlight.alpha.enabled;
    this.addView(this.highlight);
  }
};

ButtonIcon.prototype = Object.create(Button.prototype);
ButtonIcon.prototype.constructor = ButtonIcon;

ButtonIcon.prototype.alert = function(value) {
  Button.prototype.alert.call(this, value);
};

ButtonIcon.prototype.disabled = function(value) {
  Button.prototype.disabled.call(this, value);

  this._inputOut();
};

ButtonIcon.prototype._inputUp = function() {
  Button.prototype._inputUp.call(this);

  this.image.tint = this.settings.icon.tint.up;
  this.image.view.alpha = this.settings.icon.alpha.up;

  if(this.highlight) {
    this.highlight.alpha = this.settings.highlight.alpha.up;
  }
};

ButtonIcon.prototype._inputDown = function() {
  Button.prototype._inputDown.call(this);

  this.image.tint = this.settings.icon.tint.down;
  this.image.view.alpha = this.settings.icon.alpha.down;

  if(this.highlight) {
    this.highlight.alpha = this.settings.highlight.alpha.down;
  }
};

ButtonIcon.prototype._inputOver = function() {
  Button.prototype._inputOver.call(this);
  this.image.tint = this.settings.icon.tint.over;
  this.image.view.alpha = this.settings.icon.alpha.over;

  if(this.highlight) {
    this.highlight.alpha = this.settings.highlight.alpha.over;
  }
};

ButtonIcon.prototype._inputOut = function() {
  Button.prototype._inputOut.call(this);

  if(this._disabled) {
    this.image.tint = this.settings.icon.tint.disabled;
    this.image.view.alpha = this.settings.icon.alpha.disabled;

    if(this.highlight) {
      this.highlight.alpha = this.settings.highlight.alpha.disabled;
    }
  } else {
    this.image.tint = this.settings.icon.tint.enabled;
    this.image.view.alpha = this.settings.icon.alpha.enabled;

    if(this.highlight) {
      this.highlight.alpha = this.settings.highlight.alpha.enabled;
    }
  }
};

module.exports = ButtonIcon;
