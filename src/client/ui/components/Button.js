
var engine = require('engine'),
    Pane = require('./Pane'),
    Label = require('./Label'),
    StackLayout = require('../layouts/StackLayout'),
    BackgroundView = require('../views/BackgroundView'),
    ColorBlend = require('../helpers/ColorBlend'),
    Class = engine.Class;

function Button(game, settings) {
  Pane.call(this, game, Class.mixin(settings, {
    label: {
      text: '',
      bg: false
    },
    bg: {
      alpha: 0.5,
    }
  }));

  if(this.settings.alert) {
    this._alert = true;
  }

  if(this.settings.disabled) {
    this._disabled = true;
  }

  if(this.settings.selected) {
    this._selected = true;
  }

  // bg
  this.bg.alpha = this.settings.alpha;

  // input handler
  this.input = new engine.InputHandler(this.bg);

  // event handling
  this.bg.on('inputOver', this._inputOver, this);
  this.bg.on('inputOut', this._inputOut, this);
  this.bg.on('inputDown', this._inputDown, this);
  this.bg.on('inputUp', this._inputUp, this);

  if(this.settings.label) {
    this.label = new Label(game, this.settings.label);
    this.addPanel(this.label);
  }
};

Button.prototype = Object.create(Pane.prototype);
Button.prototype.constructor = Button;

Button.prototype.start = function() {
  this.bg.inputEnabled = true;
  this.bg.input.priorityID = 200;
};

Button.prototype.stop = function() {
  this.bg.inputEnabled = false;
};

Button.prototype.alert = function(value) {
  this._alert = value;
};

Button.prototype.tint = function(value) {
  this.bg.tint = value;
};

Button.prototype.disabled = function(value) {
  this._disabled = value;
  if(this._disabled) {
    this.stop();
    this.bg.alpha = 0.8;
  } else {
    this.start();
    this.bg.alpha = this.settings.alpha;
  }
};

Button.prototype._inputUp = function() {
  if(this._disabled) { return false; }
  return true;
};

Button.prototype._inputDown = function() {
  if(this._disabled) { return false; }
  return true;
};

Button.prototype._inputOver = function() {
  if(this._disabled) { return false; }
  if(this.settings.bg) {
    this.bg.alpha = 1.0;
  }
  return true;
};

Button.prototype._inputOut = function() {
  if(this._disabled) { return false; }
  if(this.settings.bg) {
    this.bg.alpha = this.settings.alpha;
  }
  return true;
};

module.exports = Button;
