
var engine = require('engine'),
    Pane = require('./Pane'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function ProgressBar(game, settings) {
  Pane.call(this, game, Class.mixin(settings, {
    bg: {
      color: 0x000000
    },
    label: {
      text: {
        fontName: 'small'
      },
      bg: false
    },
    progress: {
      color: 0xffffff,
      modifier: {
        left: 0.0,
        top: 0.0,
        width: 1.0,
        height: 1.0
      }
    },
    difference: {
      color: 0xff0000
    }
  }));

  // progress modifer
  this.modifier = this.settings.progress.modifier;

  // create progress bar
  this.progress = new BackgroundView(game, this.settings.progress);
  this.progress.modifier = this.modifier;

  if(this.settings.difference) {
    this.difference = new BackgroundView(game, this.settings.difference);

    this.addView(this.difference);
  }

  // add progress bar
  this.addView(this.progress);
};

ProgressBar.prototype = Object.create(Pane.prototype);
ProgressBar.prototype.constructor = ProgressBar;

ProgressBar.prototype.change = function(key, value) {
  var width = this.settings[key],
      current = this.modifier[key],
      difference = this.difference,
      delta;

  if(this.difference) {
    delta = current - value;

    if(delta > 0) {
      difference.modifier.left = current * width;
      difference.modifier.width = (delta-current);

      difference.paint();
      difference.alpha = 1.0;

      this.tween && this.tween.stop(false);
      this.tween = this.game.tweens.create(this.difference);
      this.tween.to({ alpha: 0.0 }, 1000);
      this.tween.start();
    }
  }

  this.modifier[key] = value;
  this.progress.paint();
};

ProgressBar.prototype.paint = function() {
  this.bg.paint();
};

module.exports = ProgressBar;
