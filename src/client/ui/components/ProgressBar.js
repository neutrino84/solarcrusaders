
var engine = require('engine'),
    Pane = require('./Pane'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function ProgressBar(game, settings) {
  Pane.call(this, game, Class.mixin(settings, {
    bg: {
      color: 0x000000
    },
    progress: {
      color: 0xffffff
    },
    difference: {
      color: 0xff0000
    }
  }));

  // create progress bar
  this.progress = new BackgroundView(game, this.settings.progress);
  this.progress.modifier = this.settings.progress.modifier;

  if(this.settings.difference) {
    this.difference = new BackgroundView(game, this.settings.difference);
    this.difference.visible = false;
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
  var width = this.size.width,
      current = this.progress.modifier[key],
      delta;

  // update change
  if(this.difference) {
    delta = current - value;

    this.difference.modifier.left = value * width;
    this.difference.modifier.width = delta;
    this.difference.visible = true;
    this.difference.paint();
  }

  this.progress.modifier[key] = value;
  this.progress.paint();
};

module.exports = ProgressBar;
