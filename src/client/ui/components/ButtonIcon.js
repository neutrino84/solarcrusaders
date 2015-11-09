
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

  // build icon
  this.addView(new BackgroundView(game, this.settings.bg));
  this.addPanel(Layout.USE_PS_SIZE, new Image(game, key, this.settings.icon));
};

ButtonIcon.prototype = Object.create(Panel.prototype);
ButtonIcon.prototype.constructor = ButtonIcon;

module.exports = ButtonIcon;
