
var engine = require('engine'),
    Pane = require('./Pane')
    ColorBlend = require('../helpers/ColorBlend'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function PaneFlash(game, settings) {
  Pane.call(this, game, Class.mixin(settings, {
    flashBg: {
      color: 0xFFFFFF,
      fillAlpha: 0.5,
      blendMode: engine.BlendMode.ADD,
      borderSize: 0.0
    }
  }));

  this.flashBg = new BackgroundView(game, this.settings.flashBg);
  this.flashBg.tint = 0x000000;

  this.colorBlend = new ColorBlend(game, this.flashBg);
  this.colorBlend.setColor(0x000000, 0x00AA00, 250, engine.Easing.Quadratic.InOut, true);
  this.colorBlend.loop = false;
  this.colorBlend.on('stop', function() {
    this.flashBg.tint = 0x000000;
  }, this);

  this.addView(this.flashBg);
};

PaneFlash.prototype = Object.create(Pane.prototype);
PaneFlash.prototype.constructor = PaneFlash;

PaneFlash.prototype.alert = function() {
  this.colorBlend.start();
};

module.exports = PaneFlash;
