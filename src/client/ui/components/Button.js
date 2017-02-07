
var engine = require('engine'),
    Panel = require('../Panel'),
    Label = require('./Label'),
    StackLayout = require('../layouts/StackLayout'),
    BackgroundView = require('../views/BackgroundView'),
    ColorBlend = require('../helpers/ColorBlend'),
    Class = engine.Class;

function Button(game, settings) {
  Panel.call(this, game, new StackLayout());

  // default styles
  this.settings = Class.mixin(settings, {
    padding: [0],
    margin: [0],
    bg: false,
    label: {
      text: '',
      bg: false
    }
  });

  if(this.settings.alert) {
    this._alert = true;
  }

  if(this.settings.disabled) {
    this._disabled = true;
  }

  if(this.settings.selected) {
    this._selected = true;
  }

  // set constraint
  if(this.settings.constraint) {
    this.constraint = this.settings.constraint;
  }
  
  // set size
  if(this.settings.width || this.settings.height) {
    this.setPreferredSize(
      this.settings.width,
      this.settings.height);
  }

  this.setPadding.apply(this, this.settings.padding);
  this.setMargin.apply(this, this.settings.margin);

  // bg
  if(this.settings.bg) {
    this.bg = new BackgroundView(game, this.settings.bg);
    this.bg.alpha = Button.REGULAR_ALPHA;

    // input handler
    this.input = new engine.InputHandler(this.bg);

    // event handling
    this.bg.on('inputOver', this._inputOver, this);
    this.bg.on('inputOut', this._inputOut, this);
    this.bg.on('inputDown', this._inputDown, this);
    this.bg.on('inputUp', this._inputUp, this);

    // build button
    this.addView(this.bg);
  }

  if(this.settings.label) {
    this.label = new Label(game, this.settings.label);
    this.addPanel(Layout.STRETCH, this.label);
  }
};

Button.prototype = Object.create(Panel.prototype);
Button.prototype.constructor = Button;

Button.REGULAR_ALPHA = 0.9;

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
  this._tint = value;
};

Button.prototype.disabled = function(value) {
  this._disabled = value;
  if(this._disabled) {
    this.stop();
    this.bg.alpha = 0.8;
  } else {
    this.start();
    this.bg.alpha = Button.REGULAR_ALPHA;
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
    this.bg.alpha = Button.REGULAR_ALPHA;
  }
  return true;
};

module.exports = Button;
