
var engine = require('engine'),
    Panel = require('../Panel'),
    Layout = require('../Layout'),
    FlowLayout = require('../layouts/FlowLayout'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function ProgressBar(game, settings) {
  Panel.call(this, game, this);

  this.decimal = 0.0;

  this.settings = Class.mixin(settings, {
    width: 256,
    height: 16,
    padding: [1],
    border: [0],
    bg: {
      fillAlpha: 1.0,
      color: 0x3f6fbf,
      borderSize: 0.0
    },
    progress: {
      fillAlpha: 1.0,
      color: 0x000000,
      borderSize: 0.0
    }
  });

  // set size
  if(this.settings.width || this.settings.height) {
    this.setPreferredSize(
      this.settings.width,
      this.settings.height);
  } else {
    throw new Error('ProgressBar component must set a preferred size');
  }

  // style
  this.setPadding.apply(this, this.settings.padding);
  this.setBorder.apply(this, this.settings.border);

  this.background = new BackgroundView(game, this.settings.bg);
  this.progress = new BackgroundView(game,
    Class.mixin(this.settings.progress, {
      size: { width: 0, height: this.settings.height - this.top - this.bottom }
    }
  ));

  // build button
  this.addView(this.background);
  this.addView(this.progress);
};

ProgressBar.prototype = Object.create(Panel.prototype);
ProgressBar.prototype.constructor = ProgressBar;

ProgressBar.prototype.calcPreferredSize = function(target) {
  return { width: this.settings.width, height: this.settings.height };
};

ProgressBar.prototype.doLayout = function() {
  this.progress.position.set(this.left, this.top);
};

ProgressBar.prototype.setProgressBar = function(decimal) {
  var progress = this.progress;
      progress.settings.size.width = (this.settings.width - this.left - this.right) * decimal;
      progress.paint(this.top, this.left, this.bottom, this.right);
  this.decimal = decimal;
};

Object.defineProperty(Panel.prototype, 'percentage', {
  get: function() {
    return global.Math.floor(this.decimal * 100);
  }
});

module.exports = ProgressBar;
