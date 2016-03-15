
var engine = require('engine'),
    Panel = require('../Panel'),
    Layout = require('../Layout'),
    Label = require('../components/Label'),
    FlowLayout = require('../layouts/FlowLayout'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function ProgressBar(game, settings) {
  Panel.call(this, game, this);

  this.value = 0.0;

  this.settings = Class.mixin(settings, {
    width: 256,
    height: 16,
    padding: [1],
    border: [0],
    label: {
      padding: [0],
      border: [0],
      bg: false,
      text: {
        fontName: 'small'
      },
      align: 'center'
    },
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

  // add label
  if(this.settings.label) {
    this.label = new Label(game, '', this.settings.label);
    this.addPanel(Layout.NONE, this.label);
  }
};

ProgressBar.prototype = Object.create(Panel.prototype);
ProgressBar.prototype.constructor = ProgressBar;

ProgressBar.prototype.calcPreferredSize = function(target) {
  return { width: this.settings.width, height: this.settings.height };
};

ProgressBar.prototype.doLayout = function() {
  if(this.settings.label) {
    this.label.setSize(this.size.width - this.right - this.left, this.size.height - this.top - this.bottom);
    this.label.setLocation(this.left, this.top);
    this.label.doLayout();
  }

  this.progress.position.set(this.left, this.top);
};

ProgressBar.prototype.setMinMax = function(min, max) {
  this.min = min;
  this.max = max;
};

ProgressBar.prototype.setProgressBar = function(value) {
  var progress = this.progress,
      label = this.label,
      min = this.min,
      max = this.max;
  
  progress.settings.size.width = (this.settings.width - this.left - this.right) * value;
  progress.paint(this.top, this.left, this.bottom, this.right);
  
  this.value = value;
  
  if(label && min !== undefined && max !== undefined) {
    label.text = global.Math.round(this.max * this.value) + '/' + this.max;
    label.blendMode = value > 0.5 ? engine.BlendMode.MULTIPLY : engine.BlendMode.ADD;
    label.doLayout();
  }
};

Object.defineProperty(Panel.prototype, 'percentage', {
  get: function() {
    return global.Math.floor(this.value * 100);
  }
});

module.exports = ProgressBar;
