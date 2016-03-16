
var engine = require('engine'),
    Panel = require('../Panel'),
    Label = require('./Label'),
    Layout = require('../Layout'),
    StackLayout = require('../layouts/StackLayout'),
    BackgroundView = require('../views/BackgroundView'),
    ColorBlend = require('../helpers/ColorBlend'),
    Class = engine.Class;

function Button(game, string, settings) {
  Panel.call(this, game, new StackLayout());

  this._alert = false;
  this._disabled = false;

  // default styles
  this.settings = Class.mixin(settings, {
    padding: [2],
    border: [0],
    bg: {
      fillAlpha: 1.0,
      color: 0x3868b8,
      borderSize: 0.0,
      blendMode: engine.BlendMode.ADD,
      radius: 4.0,
      alertColor: 0xFFFF00
    },
    label: {
      bg: {
        highlight: 0x5888d8,
        fillAlpha: 0.6,
        color: 0x3868b8,
        borderSize: 2.0,
        radius: 4.0
      }
    }
  });

  // style
  this.setPadding.apply(this, this.settings.padding);
  this.setBorder.apply(this, this.settings.border);

  this.label = new Label(game, string, this.settings.label);
  this.label.alpha = 0.9;

  this.bg = new BackgroundView(game, this.settings.bg);
  this.bg.alpha = 0.75;

  // color blend
  this.colorBlend = new ColorBlend(game, this.bg, false, 5);
  this.colorBlend.setColor(0xFFFFFF, this.settings.bg.alertColor, 250, engine.Easing.Default, true);
  this.colorBlend.on('stop', function() {
    this.bg.tint = 0xFFFFFF;
  }, this);

  // event handling
  this.bg.on('inputOver', this._inputOver, this);
  this.bg.on('inputOut', this._inputOut, this);
  this.bg.on('inputDown', this._inputDown, this);
  this.bg.on('inputUp', this._inputUp, this);

  // build button
  this.addView(this.bg);
  this.addPanel(Layout.STRETCH, this.label);

  // start
  this.start();
};

Button.prototype = Object.create(Panel.prototype);
Button.prototype.constructor = Button;

Button.prototype.start = function() {
  this.bg.inputEnabled = true;
  this.bg.input.priorityID = 2;
};

Button.prototype.stop = function() {
  this.bg.inputEnabled = false;
};

Button.prototype.alert = function() {
  this._alert = true;
  this.bg.alpha = 1.0;
  this.colorBlend.start();
};

Button.prototype._inputUp = function() {
  if(this.disabled) { return; }
  if(this._alert) {
    this._alert = false;
    this.colorBlend.stop();
  }

  this.bg.tint = 0xffffff;
  this.label.bg.tint = 0xffffff;
  this.emit('inputUp', this);
};

Button.prototype._inputDown = function() {
  if(this.disabled) { return; }

  this.bg.tint = 0xaaccee;
  this.label.bg.tint = 0xaaccee;
  this.emit('inputDown', this);
};

Button.prototype._inputOver = function() {
  if(this.disabled) { return; }

  this.bg.alpha = 1.0;
  this.label.alpha = 1.0;
};

Button.prototype._inputOut = function() {
  if(this.disabled) { return; }
  if(!this._alert) {
    this.bg.alpha = 0.75;
  }
  this.label.alpha = 0.9;
};

Object.defineProperty(Button.prototype, 'tint', {
  set: function(value) {
    this.bg.tint = value;
  },

  get: function() {
    return this.bg.tint;
  }
});

Object.defineProperty(Button.prototype, 'disabled', {
  set: function(value) {
    if(value === false) {
      this.label.alpha = 0.9;
      this.bg.alpha = 0.9;
    } else {
      this.label.alpha = 0.25;
      this.bg.alpha = 0.5;
    }
    this._disabled = value;
  },

  get: function() {
    return this._disabled;
  }
});

module.exports = Button;
