
var pixi = require('pixi'),
    engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('./Pane'),
    ImageView = require('../views/ImageView'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function ButtonIcon(game, settings) {
  Pane.call(this, game, Class.mixin(settings, {
    bg: {
      color: 0x000000,
      fillAlpha: 1.0,
      alpha: {
        enabled: 1.0,
        disabled: 1.0,
        over: 1.0,
        down: 1.0,
        up: 1.0
      }
    },
    icon: {
      key: 'texture-atlas',
      alpha: {
        enabled: 1.0,
        disabled: 0.25,
        over: 1.0,
        down: 1.0,
        up: 1.0
      },
      tint: {
        enabled: 0xffffff,
        disabled: 0x888888,
        over: 0xffffff,
        down: 0xffffff,
        up: 0xffffff
      }
    }
  }));

  // states
  this.disabled = false;

  // input handler
  this.input = new engine.InputHandler(this.bg);

  // event handling
  this.bg.on('inputOver', this._inputOver, this);
  this.bg.on('inputOut', this._inputOut, this);
  this.bg.on('inputDown', this._inputDown, this);
  this.bg.on('inputUp', this._inputUp, this);

  // add image to display
  this.image = new ImageView(game, this.settings.icon.key, this.settings.icon.frame);
  this.addView(this.image);
};

ButtonIcon.prototype = Object.create(Pane.prototype);
ButtonIcon.prototype.constructor = ButtonIcon;

ButtonIcon.prototype.start = function() {
  var bg = this.bg,
      image = this.image,
      settings = this.settings;
  
  image.tint = settings.icon.tint.up;
  image.alpha = settings.icon.alpha.up;
  
  bg.alpha = settings.bg.alpha.up;
  bg.inputEnabled = true;
};

ButtonIcon.prototype.stop = function() {
  this.bg.inputEnabled = false;
};

ButtonIcon.prototype.disable = function(value) {
  this.disabled = value;
  if(this.disabled) {
    this.stop();
  } else {
    this.start();
  }
  this._inputOut();
};

ButtonIcon.prototype._inputUp = function() {
  var bg = this.bg,
      image = this.image,
      settings = this.settings;

  image.tint = settings.icon.tint.up;
  image.alpha = settings.icon.alpha.up;
  bg.alpha = settings.bg.alpha.up;

  this.emit('inputUp', this);
};

ButtonIcon.prototype._inputDown = function() {
  var bg = this.bg,
      image = this.image,
      settings = this.settings;

  image.tint = settings.icon.tint.down;
  image.alpha = settings.icon.alpha.down;
  bg.alpha = settings.bg.alpha.down;

  this.emit('inputDown', this);
};

ButtonIcon.prototype._inputOver = function() {
  var bg = this.bg,
      image = this.image,
      settings = this.settings;

  image.tint = settings.icon.tint.over;
  image.alpha = settings.icon.alpha.over;
  bg.alpha = settings.bg.alpha.over;

  this.emit('inputOver', this);
};

ButtonIcon.prototype._inputOut = function() {
  var bg = this.bg,
      image = this.image,
      settings = this.settings;

  if(this.disabled) {
    image.tint = settings.icon.tint.disabled;
    image.alpha = settings.icon.alpha.disabled;
  } else {
    image.tint = settings.icon.tint.enabled;
    image.alpha = settings.icon.alpha.enabled;
  }

  if(this.disabled) {
    bg.alpha = settings.bg.alpha.disabled;
  } else {
    bg.alpha = settings.bg.alpha.enabled;
  }

  this.emit('inputOut', this);
};

module.exports = ButtonIcon;
