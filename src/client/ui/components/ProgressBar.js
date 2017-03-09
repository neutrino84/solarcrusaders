
var engine = require('engine'),
    Pane = require('./Pane'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function ProgressBar(game, settings) {
  Pane.call(this, game, Class.mixin(settings, {
    bg: {
      color: 0x000000
    },
    // label: {
    //   text: {
    //     fontName: 'small'
    //   },
    //   bg: false
    // },
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

ProgressBar.prototype.reset = function() {
  if(this.difference) {
    this.difference.visible = false;
  }
};

ProgressBar.prototype.percentage = function(key, value) {
  this.modifier[key] = value;
  this.progress.paint();
};

ProgressBar.prototype.change = function(key, value) {
  var width = this.settings[key],
      current = this.modifier[key],
      difference = this.difference,
      delta;

  // update change
  if(this.difference) {
    delta = current - value;

    difference.modifier.left = value * width;
    difference.modifier.width = delta;

    difference.visible = true;
    difference.alpha = 1.0;
    difference.paint();
  } else {
    difference.visible = false;
  }

  // update percentage
  this.percentage(key, value);
};

ProgressBar.prototype.paint = function() {
  this.bg.paint();
};

module.exports = ProgressBar;
