
var engine = require('engine'),
    Panel = require('../Panel'),
    Image = require('./Image'),
    Layout = require('../Layout'),
    StackLayout = require('../layouts/StackLayout'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function ButtonIcon(game, key, settings) {
  Panel.call(this, game, new StackLayout());

  // default styles
  this.settings = Class.mixin(settings, {
    padding: [2],
    border: [0],
    bg: {
      fillAlpha: 1.0,
      color: 0x3868b8,
      borderSize: 0.0,
      blendMode: engine.BlendMode.ADD,
      radius: 4.0
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

  this.bg = new BackgroundView(game, this.settings.bg);
  this.bg.inputEnabled = true;
  this.bg.input.priorityID = 2;
  this.bg.alpha = 0.75;

  // event handling
  this.bg.on('inputOver', this._inputOver, this);
  this.bg.on('inputOut', this._inputOut, this);
  this.bg.on('inputDown', this._inputDown, this);
  this.bg.on('inputUp', this._inputUp, this);

  // build icon
  this.addView(this.bg);
  this.addPanel(Layout.USE_PS_SIZE, this.image);
};

ButtonIcon.prototype = Object.create(Panel.prototype);
ButtonIcon.prototype.constructor = ButtonIcon;

ButtonIcon.prototype.on = function(name, callback, context) {
  this.bg.on.call(this.bg, name, callback, context);
};

ButtonIcon.prototype._inputUp = function() {
  this.bg.tint = 0xFFFFFF;
  this.image.bg.tint = 0xFFFFFF;
  // this.emit('inputUp', this);
};

ButtonIcon.prototype._inputDown = function() {
  this.bg.tint = 0xaaccFF;
  this.image.bg.tint = 0xaaccFF;
  // this.emit('inputDown', this);
};

ButtonIcon.prototype._inputOver = function() {
  this.bg.alpha = 1.0;
  this.image.alpha = 1.0;
};

ButtonIcon.prototype._inputOut = function() {
  this.bg.alpha = 0.75;
  this.image.alpha = 0.9;
};

module.exports = ButtonIcon;
