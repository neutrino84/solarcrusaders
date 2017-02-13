
var engine = require('engine'),
    Pane = require('./Pane'),
    Label = require('./Label'),
    StackLayout = require('../layouts/StackLayout'),
    ColorBlend = require('../helpers/ColorBlend'),
    Class = engine.Class;

function Button(game, settings) {
  Pane.call(this, game, Class.mixin(settings, {
    label: false,
    bg: {
      alpha: {
        enabled: 1.0,
        disabled: 1.0,
        over: 1.0,
        down: 1.0,
        up: 1.0
      }
    }
  }));

  this._alert = false;
  this._disabled = false;

  // input handler
  this.input = new engine.InputHandler(this.bg);

  // event handling
  this.bg.on('inputOver', this._inputOver, this);
  this.bg.on('inputOut', this._inputOut, this);
  this.bg.on('inputDown', this._inputDown, this);
  this.bg.on('inputUp', this._inputUp, this);

  this.bg.alpha = this._disabled ? 
    this.settings.bg.alpha.disabled :
    this.settings.bg.alpha.enabled;

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

Button.prototype.alert = function(value) {
  this._alert = value;
};

Button.prototype.disabled = function(value) {
  this._disabled = value;
  if(this._disabled) {
    this.stop();
  } else {
    this.start();
  }
  this._inputOut();
};

Button.prototype._inputUp = function() {
  this.bg.alpha = this.settings.bg.alpha.up;
};

Button.prototype._inputDown = function() {
  this.bg.alpha = this.settings.bg.alpha.down;
};

Button.prototype._inputOver = function() {
  this.bg.alpha = this.settings.bg.alpha.over;
};

Button.prototype._inputOut = function() {
  if(this._disabled) {
    this.bg.alpha = this.settings.bg.alpha.disabled;
  } else {
    this.bg.alpha = this.settings.bg.alpha.enabled;
  }
};

module.exports = Button;
