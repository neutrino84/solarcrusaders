
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
        left: 1.0,
        top: 1.0,
        width: 1.0,
        height: 1.0
      }
    }
  }));

  // progress modifer
  this.modifier = this.settings.progress.modifier;

  // create progress bar
  this.progress = new BackgroundView(game, this.settings.progress);
  this.progress.modifier = this.modifier;

  this.progressTween = this.game.tweens.create(this.progress.modifier);
  this.progressTween.onUpdateCallback(this.progress.paint, this.progress);

  if(this.settings.change) {
    this.change = new BackgroundView(game, this.settings.change);
    this.addView(this.change);
  }

  // add progress bar
  this.addView(this.progress);
};

ProgressBar.prototype = Object.create(Pane.prototype);
ProgressBar.prototype.constructor = ProgressBar;

ProgressBar.prototype.change = function(key, value) {
  // var change = {};
  //     change[key] = value;

  this.modifier[key] = value;
  this.progress.paint();

  // if(!this.progressTween.isRunning) {
  //   console.log('from', this.modifier.width);
  //   this.progressTween.to(change, 50);
  //   this.progressTween.start();
  // }
};

ProgressBar.prototype.paint = function() {
  this.bg.paint();
};

module.exports = ProgressBar;
