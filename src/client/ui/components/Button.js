
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

  this.alerting = false;
  this.disabled = false;

  // input handler
  this.input = new engine.InputHandler(this.bg);

  // event handling
  this.bg.on('inputOver', this._inputOver, this);
  this.bg.on('inputOut', this._inputOut, this);
  this.bg.on('inputDown', this._inputDown, this);
  this.bg.on('inputUp', this._inputUp, this);

  this.bg.alpha = this.disabled ? 
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
  this.alerting = value;
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

Button.prototype._inputUp = function() {
  this.bg.alpha = this.settings.bg.alpha.up;
  this.emit('inputUp');
};

Button.prototype._inputDown = function() {
  this.bg.alpha = this.settings.bg.alpha.down;
  this.emit('inputDown');
};

Button.prototype._inputOver = function() {
  this.bg.alpha = this.settings.bg.alpha.over;
  this.emit('inputOver');
};

Button.prototype._inputOut = function() {
  var bg = this.bg,
      settings = this.settings;
  if(this.disabled) {
    bg.alpha = settings.bg.alpha.disabled;
  } else {
    bg.alpha = settings.bg.alpha.enabled;
  }
  this.emit('inputOut');
};

module.exports = Button;
