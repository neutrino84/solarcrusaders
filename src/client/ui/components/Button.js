
var engine = require('engine'),
    Pane = require('./Pane'),
    Label = require('./Label'),
    StackLayout = require('../layouts/StackLayout'),
    ColorBlend = require('../helpers/ColorBlend'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function Button(game, settings) {
  Pane.call(this, game, Class.mixin(settings, {
    label: false,
    togglable: false,
    toggled: false,
    label: {
      font: {
        name: 'full'
      }
    },
    bg: {
      color: 0x000000,
      fillAlpha: 1.0,
      alpha: {
        disabled: 0.5,
        over: 1.0,
        down: 1.0,
        up: 1.0
      }
    }
  }));

  // states
  this.disabled = false;
  this.togglable = this.settings.togglable;
  this.toggled = this.settings.toggled;

  // event handling
  this.bg.on('inputOver', this._inputOver, this);
  this.bg.on('inputOut', this._inputOut, this);
  this.bg.on('inputDown', this._inputDown, this);
  this.bg.on('inputUp', this._inputUp, this);
  this.bg.alpha = this.settings.bg.alpha.up;

  if(this.settings.togglable) {
    this.toggling = new BackgroundView(this.game, this.settings.toggle);
    this.toggling.alpha = this.settings.toggle.alpha.up;
    this.addView(this.toggling);
  }

  if(this.settings.label) {
    this.label = new Label(game, this.settings.label);
    this.addPanel(this.label);
  }
};

Button.prototype = Object.create(Pane.prototype);
Button.prototype.constructor = Button;

Button.prototype.start = function() {
  this.bg.inputEnabled = true;
};

Button.prototype.stop = function() {
  this.bg.inputEnabled = false;
};

Button.prototype.disable = function(value) {
  this.disabled = value;
  if(this.disabled) {
    this.stop();
  } else {
    this.start();
  }
  this._inputOut();
};

Button.prototype.toggle = function() {
  if(this.togglable) {
    if(this.toggled === true) {
      this.toggled = false;
      this.toggling.alpha = this.settings.toggle.alpha.up;
      this.label.tint = this.settings.label.font.color;
    } else {
      this.toggled = true;
      this.toggling.alpha = this.settings.toggle.alpha.toggled;
      this.label.tint = this.settings.toggle.label.toggled;
    }
  }
};

Button.prototype._inputUp = function() {
  this.toggle();
  this.bg.alpha = this.settings.bg.alpha.up;
  this.emit('inputUp', this);
};

Button.prototype._inputDown = function() {
  if(this.togglable) {
    this.toggling.alpha = this.settings.toggle.alpha.down;
  }
  this.bg.alpha = this.settings.bg.alpha.down;
  this.emit('inputDown', this);
};

Button.prototype._inputOver = function() {
  if(this.togglable) {
    this.toggling.alpha = this.toggled ?
      this.settings.toggle.alpha.toggled :
      this.settings.toggle.alpha.over;
  }
  this.bg.alpha = this.settings.bg.alpha.over;
  this.emit('inputOver', this);
};

Button.prototype._inputOut = function() {
  if(this.togglable) {
    this.toggling.alpha = this.disabled ?
      this.settings.toggle.alpha.disabled : (
        this.toggled ?
          this.settings.toggle.alpha.toggled :
          this.settings.toggle.alpha.up
      );
  }
  this.bg.alpha = this.disabled ?
    this.settings.bg.alpha.disabled :
    this.settings.bg.alpha.up;
  this.emit('inputOut', this);
};

module.exports = Button;
