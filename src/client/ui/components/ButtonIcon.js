
var engine = require('engine'),
    Panel = require('../Panel'),
    Image = require('./Image'),
    Layout = require('../Layout'),
    StackLayout = require('../layouts/StackLayout'),
    BackgroundView = require('../views/BackgroundView'),
    ColorBlend = require('../helpers/ColorBlend'),
    Class = engine.Class;

function ButtonIcon(game, key, settings) {
  Panel.call(this, game, new StackLayout());

  this._alert = false;
  this._selected = false;
  this._disabled = false;
  this._tempPosition = new engine.Point();

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
      disabled: 0x333333
    },
    icon: {
      bg: {
        highlight: 0x5888d8,
        fillAlpha: 0.75,
        color: 0x3868b8,
        borderSize: 2.0,
        radius: 4.0
      }
    }
  });

  // style
  this.setPadding.apply(this, this.settings.padding);
  this.setBorder.apply(this, this.settings.border);

  this.image = new Image(game, key, this.settings.icon);

  if(this.settings.disabled) {
    this.disabled = true;
  }

  // input handler
  this.input = new engine.InputHandler(this);
  this.input.start(2);

  // color blend
  this.colorBlend = new ColorBlend(game, this.image);
  this.colorBlend.setColor(0x336699, 0x33cc33, 250, engine.Easing.Quadratic.InOut, true);
  this.colorBlend.on('stop', function() {
    this.image.tint = 0xFFFFFF;
  }, this);

  // event handling
  this.on('inputOver', this._inputOver, this);
  this.on('inputOut', this._inputOut, this);
  this.on('inputDown', this._inputDown, this);
  this.on('inputUp', this._inputUp, this);

  // build icon
  if(this.settings.bg) {
    this.bg = new BackgroundView(game, this.settings.bg);
    this.bg.alpha = 0.75;
    this.addView(this.bg);
  } else {
    this.bg = {};
  }

  this.addPanel(Layout.USE_PS_SIZE, this.image);
};

ButtonIcon.prototype = Object.create(Panel.prototype);
ButtonIcon.prototype.constructor = ButtonIcon;

ButtonIcon.prototype.start = function(priority) {
  this.input.start(priority || 2);
};

ButtonIcon.prototype.stop = function() {
  this.input.stop();
};

ButtonIcon.prototype.alert = function() {
  this._alert = true;
  this.image.alpha = 1.0;
  this.colorBlend.start();
};

ButtonIcon.prototype.enableDrag = function() {
  this.input.enableDrag();
  this.on('dragStart', this._dragStart, this); 
};

ButtonIcon.prototype._dragStart = function() {
  this._tempPosition.copyFrom(this.position);
  this.once('dragStop', this._dragStop, this);
};

ButtonIcon.prototype._dragStop = function() {
  var tween = game.tweens.create(this.position);
      tween.to({ x: this._tempPosition.x , y: this._tempPosition.y }, 150, engine.Easing.Quadratic.Out);
      tween.start();
};

ButtonIcon.prototype._inputUp = function() {
  if(!this.disabled) {
    if(this._alert) {
      this._alert = false;
      this.colorBlend.stop();
    }
    this.bg.tint = 0xffffff;
    this.image.bg.tint = 0xffffff;
  }
};

ButtonIcon.prototype._inputDown = function() {
  if(this.disabled) { return; }

  this.bg.tint = 0xaaccee;
  this.image.bg.tint = 0xaaccee;
};

ButtonIcon.prototype._inputOver = function() {
  if(this.disabled) { return; }

  this.image.alpha = 1.0;
  this.bg.alpha = 1.0;
};

ButtonIcon.prototype._inputOut = function() {
  if(this.disabled) { return; }
  if(!this._alert) {
    this.image.alpha = 0.9;
  }
  this.bg.alpha = 0.75;
};

Object.defineProperty(ButtonIcon.prototype, 'tint', {
  set: function(value) {
    this.image.tint = value;
  },

  get: function() {
    return this.image.tint;
  }
});

Object.defineProperty(ButtonIcon.prototype, 'selected', {
  set: function(value) {
    if(value === true) {
      this._disabled = true;
      this.bg.tint = 0x00FF00;
      this.image.tint = 0x88FF88;
      this.image.bg.tint = 0x00FF00;
      this.image.alpha = 1.0;
    } else {
      this._disabled = false;
      this.bg.tint = 0xFFFFFF;
      this.image.tint = 0xFFFFFF;
      this.image.bg.tint = 0xFFFFFF;
      this.image.alpha = 0.9;
    }
    this._selected = value;
  },

  get: function() {
    return this._selected;
  }
});

Object.defineProperty(ButtonIcon.prototype, 'disabled', {
  set: function(value) {
    if(value === false) {
      this.image.alpha = 0.9;
      this.bg.tint = 0xFFFFFF;
    } else {
      this.image.alpha = 0.25;
      this.bg.tint = this.settings.bg.disabled;
    }
    this._disabled = value;
  },

  get: function() {
    return this._disabled;
  }
});

module.exports = ButtonIcon;
