
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

ButtonIcon.prototype.disable = function(value) {
  this._disabled = value;
  
  if(this._disabled) {
    this.stop();
  } else {
    this.start();
  }
  
  this._inputOut();
};

ButtonIcon.prototype._inputUp = function() {
  var bg = this.bg,
      image = this.image,
      settings = this.settings,
      highlight = this.highlight;

  image.tint = settings.icon.tint.up;
  image.view.alpha = settings.icon.alpha.up;

  if(highlight) {
    highlight.alpha = settings.highlight.alpha.up;
  }

  bg.alpha = settings.bg.alpha.up;

  this.emit('inputUp');
};

ButtonIcon.prototype._inputDown = function() {
  var bg = this.bg,
      image = this.image,
      settings = this.settings,
      highlight = this.highlight;

  image.tint = settings.icon.tint.down;
  image.view.alpha = settings.icon.alpha.down;

  if(highlight) {
    highlight.alpha = settings.highlight.alpha.down;
  }

  bg.alpha = settings.bg.alpha.down;

  this.emit('inputDown');
};

ButtonIcon.prototype._inputOver = function() {
  var bg = this.bg,
      image = this.image,
      settings = this.settings,
      highlight = this.highlight;

  image.tint = settings.icon.tint.over;
  image.view.alpha = settings.icon.alpha.over;

  if(highlight) {
    highlight.alpha = settings.highlight.alpha.over;
  }

  bg.alpha = settings.bg.alpha.over;

  this.emit('inputOver');
};

ButtonIcon.prototype._inputOut = function() {
  var bg = this.bg,
      image = this.image,
      settings = this.settings,
      highlight = this.highlight;

  if(this._disabled) {
    image.tint = settings.icon.tint.disabled;
    image.view.alpha = settings.icon.alpha.disabled;

    if(highlight) {
      highlight.alpha = settings.highlight.alpha.disabled;
    }
  } else {
    image.tint = settings.icon.tint.enabled;
    image.view.alpha = settings.icon.alpha.enabled;

    if(highlight) {
      highlight.alpha = settings.highlight.alpha.enabled;
    }
  }

  if(this._disabled) {
    bg.alpha = settings.bg.alpha.disabled;
  } else {
    bg.alpha = settings.bg.alpha.enabled;
  }

  this.emit('inputOut');
};

module.exports = ButtonIcon;
