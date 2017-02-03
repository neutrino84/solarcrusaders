
var engine = require('engine'),
    Pane = require('./Pane'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function ProgressBar(game, settings) {
  Pane.call(this, game, Class.mixin(settings, {
    width: 256,
    height: 16,
    padding: [0],
    margin: [0],
    layout: {
      type: 'stack'
    },
    label: {
      padding: [0],
      margin: [0],
      text: {
        fontName: 'small'
      },
      align: 'center'
    },
    bg: {
      color: 0x3f6fbf
    },
    progress: {
      fillAlpha: 1.0,
      color: 0xffffff,
      borderSize: 0.0
    }
  }));

  this.progress = new BackgroundView(game, Class.mixin(
    this.settings.progress, {
      size: { width: 0, height: this.settings.height }
    }
  ));

  // build button
  this.addView(this.progress);
};

ProgressBar.prototype = Object.create(Pane.prototype);
ProgressBar.prototype.constructor = ProgressBar;

ProgressBar.prototype.amount = function(value) {
  this.progress.settings.size.width = (this.settings.width - this.left - this.right) * value;
  this.progress.paint();
};

module.exports = ProgressBar;
